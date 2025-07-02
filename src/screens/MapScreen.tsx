import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
  TextInput,
  Keyboard,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"; // Import FontAwesome5
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ThemeContext } from "../context/ThemeContext";
import { darkMapStyle } from "../styles/mapStyles";

// Type Definitions
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_id?: number;
}

type TransportMode = "car" | "bicycle" | "motorcycle";
type MapViewType = "standard" | "satellite";

interface Route {
  id: string;
  title: string;
  distance: string;
  duration: string;
  eta: string;
  coordinates: LocationCoordinates[];
  isFastest: boolean;
  hasFlood: boolean;
  hasWarning?: boolean;
}

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const TARGET_REGION_QUERY = ", San Fernando, Pampanga, Philippines";

const MapScreen = () => {
  const { theme, themeType } = useContext(ThemeContext);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State Variables
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [fromAddressInput, setFromAddressInput] = useState("");
  const [destination, setDestination] = useState<LocationCoordinates | null>(
    null
  );
  const [destinationInput, setDestinationInput] = useState("");
  const [resolvedDestinationName, setResolvedDestinationName] = useState(
    "Tap on map or search for destination"
  );
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>("car");
  const [mapType, setMapType] = useState<MapViewType>("standard");
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFindingRoute, setIsFindingRoute] = useState(false);
  const [showFloodAlert, setShowFloodAlert] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(true);

  // Autocomplete States
  const [fromSuggestions, setFromSuggestions] = useState<
    NominatimSearchResult[]
  >([]);
  const [toSuggestions, setToSuggestions] = useState<NominatimSearchResult[]>(
    []
  );
  const [isFetchingFromSuggestions, setIsFetchingFromSuggestions] =
    useState(false);
  const [isFetchingToSuggestions, setIsFetchingToSuggestions] = useState(false);

  // Debounce timers
  const fromSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const toSearchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Bottom Sheet Snap Points
  const snapPoints = useMemo(() => ["38%", "90%"], []);

  // Helper: Geocode Address to Coordinates using Nominatim
  const geocodeAddress = useCallback(
    async (address: string): Promise<LocationCoordinates | null> => {
      if (!address) return null;
      const fullQuery = address.includes(TARGET_REGION_QUERY.substring(1))
        ? address
        : address + TARGET_REGION_QUERY;
      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
            fullQuery
          )}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "FloodSenseApp/1.0 (contact@floodsense.com)",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Nominatim geocoding API error:",
            response.status,
            errorText
          );
          Alert.alert(
            "Geocoding Error",
            "Could not find the location. Please check the address and try again."
          );
          return null;
        }
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
        }
      } catch (error) {
        console.error("Error geocoding address with Nominatim:", error);
        Alert.alert(
          "Network Error",
          "Failed to connect to geocoding service. Please check your internet connection."
        );
      }
      return null;
    },
    []
  );

  // Helper: Reverse Geocode Coordinates to Address Name using Nominatim
  const reverseGeocodeCoordinates = useCallback(
    async (coordinate: LocationCoordinates): Promise<string> => {
      if (!coordinate) return "Unknown Location";
      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&format=json`,
          {
            headers: {
              "User-Agent": "FloodSenseApp/1.0 (contact@floodsense.com)",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Nominatim reverse geocoding API error:",
            response.status,
            errorText
          );
          return "Unknown Location";
        }
        const data = await response.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      } catch (error) {
        console.error("Error reverse geocoding with Nominatim:", error);
      }
      return "Selected Location";
    },
    []
  );

  // Function to fetch and set current device location
  const handleSetCurrentLocation = useCallback(async () => {
    setIsGettingCurrentLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access location was denied. Please enable it in your device settings."
      );
      setIsGettingCurrentLocation(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(userLocation);
      const address = await reverseGeocodeCoordinates(userLocation);
      setFromAddressInput(address);
      setFromSuggestions([]);
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Location Error", "Could not get your current location.");
      // Fallback if current location fails: set a default for San Fernando, Pampanga
      const defaultSanFernandoCoords = {
        latitude: 15.0217,
        longitude: 120.6901,
      };
      setCurrentLocation(defaultSanFernandoCoords);
      setFromAddressInput("San Fernando, Pampanga, Philippines");
      mapRef.current?.animateToRegion({
        ...defaultSanFernandoCoords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } finally {
      setIsGettingCurrentLocation(false);
    }
  }, [reverseGeocodeCoordinates]);

  // Initial location fetch on component mount
  useEffect(() => {
    handleSetCurrentLocation();
    let locationSubscription: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (newLocation) => {
        if (isNavigating) {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setCurrentLocation(newCoords);
          mapRef.current?.animateCamera(
            {
              center: newCoords,
              pitch: 60,
              heading: newLocation.coords.heading || 0,
              zoom: 17,
            },
            { duration: 500 }
          );
        }
      }
    ).then((sub) => {
      locationSubscription = sub;
    });

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isNavigating, handleSetCurrentLocation]);

  // Effect: Fetch Routes when Destination or Transport Mode Changes
  useEffect(() => {
    if (currentLocation && destination) {
      fetchRoutes(transportMode);
    } else {
      setRoutes([]); // Clear routes if either current location or destination is missing
      setSelectedRouteId(null); // Clear selected route
    }
  }, [destination, transportMode, currentLocation]);

  // Helper: Get Speed Factor for Route Simulation
  const getSpeedFactor = useCallback((mode: TransportMode) => {
    switch (mode) {
      case "car":
        return 13.89;
      case "bicycle":
        return 5.56;
      case "motorcycle":
        return 11.11;
      default:
        return 13.89;
    }
  }, []);

  // Function: Simulate Route Fetching
  const fetchRoutes = useCallback(
    (mode: TransportMode) => {
      if (!currentLocation || !destination) {
        setRoutes([]);
        setSelectedRouteId(null);
        return;
      }

      setIsFindingRoute(true);
      setShowFloodAlert(false);

      setTimeout(() => {
        const speed = getSpeedFactor(mode);

        const R = 6371e3;
        const φ1 = (currentLocation.latitude * Math.PI) / 180;
        const φ2 = (destination.latitude * Math.PI) / 180;
        const Δφ =
          ((destination.latitude - currentLocation.latitude) * Math.PI) / 180;
        const Δλ =
          ((destination.longitude - currentLocation.longitude) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const baseDistanceMeters = R * c;

        const distanceKm1 = (baseDistanceMeters / 1000).toFixed(1);
        const durationMin1 = Math.round(baseDistanceMeters / speed / 60);
        const distanceKm2 = ((baseDistanceMeters * 1.2) / 1000).toFixed(1);
        const durationMin2 = Math.round(
          (baseDistanceMeters * 1.2) / speed / 60
        );
        const distanceKm3 = ((baseDistanceMeters * 1.5) / 1000).toFixed(1);
        const durationMin3 = Math.round(
          (baseDistanceMeters * 1.5) / speed / 60
        );

        const route1: Route = {
          id: "route-1",
          title: "Fastest Route",
          distance: `${distanceKm1} km`,
          duration: `${durationMin1} min`,
          eta: `ETA ${new Date(
            Date.now() + durationMin1 * 60 * 1000
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          coordinates: [
            currentLocation,
            {
              latitude:
                currentLocation.latitude +
                (destination.latitude - currentLocation.latitude) * 0.3,
              longitude:
                currentLocation.longitude +
                (destination.longitude - currentLocation.longitude) * 0.2,
            },
            {
              latitude:
                currentLocation.latitude +
                (destination.latitude - currentLocation.latitude) * 0.7,
              longitude:
                currentLocation.longitude +
                (destination.longitude - currentLocation.longitude) * 0.9,
            },
            destination,
          ],
          isFastest: true,
          hasFlood: Math.random() > 0.8, // Simulate flood on fastest route sometimes
          hasWarning: false, // Ensure no warning if it has a flood
        };

        const route2: Route = {
          id: "route-2",
          title: "Alternative",
          distance: `${distanceKm2} km`,
          duration: `${durationMin2} min`,
          eta: `ETA ${new Date(
            Date.now() + durationMin2 * 60 * 1000
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          coordinates: [
            currentLocation,
            {
              latitude:
                currentLocation.latitude +
                (destination.latitude - currentLocation.latitude) * 0.1,
              longitude:
                currentLocation.longitude +
                (destination.longitude - currentLocation.longitude) * 0.5,
            },
            {
              latitude:
                currentLocation.latitude +
                (destination.latitude - currentLocation.latitude) * 0.8,
              longitude:
                currentLocation.longitude +
                (destination.longitude - currentLocation.longitude) * 0.1,
            },
            destination,
          ],
          isFastest: false,
          hasFlood: Math.random() > 0.9, // Less likely to have flood
          hasWarning: Math.random() > 0.5, // More likely to have warning
        };

        const route3: Route = {
          id: "route-3",
          title: "Longer Path",
          distance: `${distanceKm3} km`,
          duration: `${durationMin3} min`,
          eta: `ETA ${new Date(
            Date.now() + durationMin3 * 60 * 1000
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          coordinates: [
            currentLocation,
            {
              latitude: currentLocation.latitude - 0.01,
              longitude: currentLocation.longitude + 0.005,
            },
            {
              latitude: destination.latitude + 0.005,
              longitude: destination.longitude - 0.01,
            },
            destination,
          ],
          isFastest: false,
          hasFlood: Math.random() > 0.7,
          hasWarning: false, // Ensure no warning if it has a flood
        };

        const allRoutes = [route1, route2, route3].filter(
          (r) => r.coordinates.length > 1
        );

        let finalSelectedRouteId = route1.id;
        // Logic to suggest alternative if fastest has flood
        if (route1.hasFlood) {
          setShowFloodAlert(true); // Show general flood alert
          const alternatives = allRoutes.filter((r) => !r.hasFlood);
          if (alternatives.length > 0) {
            // Prioritize routes with no warning over routes with warning
            const nonWarningAlternatives = alternatives.filter(
              (r) => !r.hasWarning
            );
            if (nonWarningAlternatives.length > 0) {
              finalSelectedRouteId = nonWarningAlternatives[0].id;
            } else {
              finalSelectedRouteId = alternatives[0].id; // Pick first alternative with a warning
            }
          } else {
            // If all routes have floods, keep fastest or first one.
            finalSelectedRouteId = route1.id;
          }
        } else {
          // If fastest has no flood, check if it has a warning
          if (route1.hasWarning) {
            // Maybe alert for warning or suggest an alternative without warning
            // For now, let's keep it selected but show the warning color
          }
          finalSelectedRouteId = route1.id;
        }

        setRoutes(allRoutes);
        setSelectedRouteId(finalSelectedRouteId);

        setIsFindingRoute(false);
        mapRef.current?.fitToCoordinates([currentLocation, destination], {
          edgePadding: {
            top: 100,
            right: 50,
            bottom: Dimensions.get("window").height * 0.45,
            left: 50,
          },
          animated: true,
        });
      }, 1500);
    },
    [currentLocation, destination, getSpeedFactor]
  );

  // Handler: Set Destination on Map Press
  const handleSetDestination = useCallback(
    async (coordinate: LocationCoordinates) => {
      setDestination(coordinate);
      const name = await reverseGeocodeCoordinates(coordinate);
      setResolvedDestinationName(name);
      setDestinationInput(name);
      setToSuggestions([]);
      bottomSheetRef.current?.collapse();
      Keyboard.dismiss();
    },
    [reverseGeocodeCoordinates]
  );

  // Handler: Geocode 'From' address on submit
  const handleFromAddressSubmit = useCallback(async () => {
    if (fromAddressInput.trim() === "") {
      Alert.alert(
        "Empty 'From' field",
        "Please enter a starting address or allow current location access."
      );
      return;
    }
    Keyboard.dismiss();
    setFromSuggestions([]);
    setIsFindingRoute(true);
    const coords = await geocodeAddress(fromAddressInput);
    if (coords) {
      setCurrentLocation(coords);
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    setIsFindingRoute(false);
  }, [fromAddressInput, geocodeAddress]);

  // Handler: Geocode destination input on submit
  const handleDestinationSubmit = useCallback(async () => {
    if (destinationInput.trim() === "") {
      setDestination(null);
      setResolvedDestinationName("Tap on map or search for destination");
      setRoutes([]);
      setSelectedRouteId(null);
      return;
    }

    Keyboard.dismiss();
    setToSuggestions([]);
    setIsFindingRoute(true);

    const coords = await geocodeAddress(destinationInput);
    if (coords) {
      setDestination(coords);
      const name = await reverseGeocodeCoordinates(coords);
      setResolvedDestinationName(name);
    } else {
      setDestination(null);
      setResolvedDestinationName("Location not found");
      setRoutes([]);
      setSelectedRouteId(null);
    }
    setIsFindingRoute(false);
  }, [destinationInput, geocodeAddress, reverseGeocodeCoordinates]);

  // --- Autocomplete Logic ---
  const fetchAutocompleteSuggestions = useCallback(
    async (query: string, isFromField: boolean) => {
      if (query.length < 3) {
        if (isFromField) setFromSuggestions([]);
        else setToSuggestions([]);
        return;
      }

      if (isFromField) setIsFetchingFromSuggestions(true);
      else setIsFetchingToSuggestions(true);

      const fullQuery = query.includes(TARGET_REGION_QUERY.substring(1))
        ? query
        : query + TARGET_REGION_QUERY;

      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
            fullQuery
          )}&format=json&limit=5`,
          {
            headers: {
              "User-Agent": "FloodSenseApp/1.0 (contact@floodsense.com)",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Nominatim autocomplete API error (${
              isFromField ? "From" : "To"
            }):`,
            response.status,
            errorText
          );
          return;
        }
        const data: NominatimSearchResult[] = await response.json();
        // Further filter results to ensure they are related to San Fernando, Pampanga
        const filteredData = data.filter(
          (item) =>
            item.display_name
              .toLowerCase()
              .includes("san fernando, pampanga") ||
            item.display_name.toLowerCase().includes("pampanga") ||
            item.display_name.toLowerCase().includes("philippines")
        );

        if (isFromField) setFromSuggestions(filteredData);
        else setToSuggestions(filteredData);
      } catch (error) {
        console.error(
          `Error fetching autocomplete suggestions (${
            isFromField ? "From" : "To"
          }):`,
          error
        );
      } finally {
        if (isFromField) setIsFetchingFromSuggestions(false);
        else setIsFetchingToSuggestions(false);
      }
    },
    []
  );

  // Debounced handler for 'From' input
  const handleFromInputChange = useCallback(
    (text: string) => {
      setFromAddressInput(text);
      if (fromSearchDebounceRef.current) {
        clearTimeout(fromSearchDebounceRef.current);
      }
      fromSearchDebounceRef.current = setTimeout(() => {
        fetchAutocompleteSuggestions(text, true);
      }, 500);
    },
    [fetchAutocompleteSuggestions]
  );

  // Debounced handler for 'To' input
  const handleToInputChange = useCallback(
    (text: string) => {
      setDestinationInput(text);
      if (toSearchDebounceRef.current) {
        clearTimeout(toSearchDebounceRef.current);
      }
      toSearchDebounceRef.current = setTimeout(() => {
        fetchAutocompleteSuggestions(text, false);
      }, 500);
    },
    [fetchAutocompleteSuggestions]
  );

  // Handler when a 'From' suggestion is selected
  const selectFromSuggestion = useCallback(
    async (item: NominatimSearchResult) => {
      setFromAddressInput(item.display_name);
      setCurrentLocation({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
      setFromSuggestions([]);
      Keyboard.dismiss();
      mapRef.current?.animateToRegion({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    },
    []
  );

  // Handler when a 'To' suggestion is selected
  const selectToSuggestion = useCallback(
    async (item: NominatimSearchResult) => {
      setDestinationInput(item.display_name);
      setResolvedDestinationName(item.display_name);
      setDestination({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      });
      setToSuggestions([]);
      Keyboard.dismiss();
      mapRef.current?.animateToRegion({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    },
    []
  );

  // Handler: Start Navigation
  const startNavigation = useCallback(() => {
    if (!currentLocation || !selectedRouteId) {
      Alert.alert("Error", "Please select a route to start navigation.");
      return;
    }

    const currentRoute = routes.find((r) => r.id === selectedRouteId);
    if (currentRoute && currentRoute.hasFlood) {
      Alert.alert(
        "Danger Ahead!",
        "The selected route has a detected flood and might be impassable. Please consider an alternative route."
      );
      return;
    }
    if (currentRoute && currentRoute.hasWarning) {
      Alert.alert(
        "Warning!",
        "The selected route has a warning (e.g., heavy traffic, minor obstruction). Proceed with caution."
      );
      // You might still allow navigation with a warning
    }

    setIsNavigating(true);
    bottomSheetRef.current?.collapse();
    mapRef.current?.animateCamera(
      {
        center: currentLocation,
        pitch: 60,
        heading: 0,
        zoom: 17,
      },
      { duration: 1000 }
    );
  }, [currentLocation, selectedRouteId, routes]);

  // Handler: Stop Navigation
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setShowFloodAlert(false); // Reset flood alert
    setDestination(null); // Clear destination coordinates
    setDestinationInput(""); // Clear destination input text
    setResolvedDestinationName("Tap on map or search for destination"); // Reset destination display name
    setRoutes([]); // Clear all routes
    setSelectedRouteId(null); // Clear selected route
    setToSuggestions([]); // Clear any destination search suggestions

    bottomSheetRef.current?.expand();
    if (currentLocation) {
      // After stopping, just center on current location
      mapRef.current?.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.05, // Slightly wider view
        longitudeDelta: 0.05,
      });
    }
  }, [currentLocation]); // currentLocation is a dependency because the map centers on it

  // Handler for the "Route Planning" icon
  const handleViewRoutesOnMap = useCallback(() => {
    if (!currentLocation) {
      Alert.alert(
        "Missing Start Location",
        "Please set your starting location (or allow current location access) to view routes."
      );
      return;
    }
    if (!destination) {
      Alert.alert(
        "Missing Destination",
        "Please set your destination to view routes. You can tap on the map or use the search bar."
      );
      return;
    }

    // Ensure bottom sheet is open to show route details
    bottomSheetRef.current?.expand();
    // Fit map to show both locations and the planned route(s)
    mapRef.current?.fitToCoordinates([currentLocation, destination], {
      edgePadding: {
        top: 100,
        right: 50,
        bottom: Dimensions.get("window").height * 0.45, // Adjust based on bottom sheet size
        left: 50,
      },
      animated: true,
    });
  }, [currentLocation, destination]);

  // Render Transport Mode Buttons
  const renderTransportModes = useCallback(
    () => (
      <View style={styles.transportContainer}>
        {[
          { type: "car", icon: "car-sport", IconComponent: Ionicons },
          { type: "bicycle", icon: "bicycle", IconComponent: Ionicons },
          {
            type: "motorcycle",
            icon: "motorcycle",
            IconComponent: FontAwesome5,
          }, // Changed to FontAwesome5 and 'motorcycle' icon name
        ].map((mode) => (
          <TouchableOpacity
            key={mode.type}
            style={[
              styles.transportButton,
              transportMode === mode.type && {
                backgroundColor: theme.colors.primary + "33",
              },
            ]}
            onPress={() => setTransportMode(mode.type as TransportMode)}
          >
            <mode.IconComponent // Dynamically render the correct icon component
              name={mode.icon as any}
              size={24}
              color={
                transportMode === mode.type
                  ? theme.colors.primary
                  : theme.colors.text
              }
            />
          </TouchableOpacity>
        ))}
      </View>
    ),
    [transportMode, theme.colors.primary, theme.colors.text]
  );

  const selectedRoute = useMemo(() => {
    return routes.find((route) => route.id === selectedRouteId);
  }, [routes, selectedRouteId]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        {/* MapView Component */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          customMapStyle={darkMapStyle}
          mapType={mapType}
          showsUserLocation={false}
          onPress={(e) => handleSetDestination(e.nativeEvent.coordinate)}
        >
          {/* Current Location Marker (User's Puck) */}
          {currentLocation && (
            <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={[
                  styles.userLocationPuck,
                  {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.card,
                  },
                ]}
              />
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
              <View
                style={[
                  styles.destinationMarker,
                  {
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.card,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </View>
            </Marker>
          )}

          {/* Route Polylines - Only render the selected route */}
          {selectedRouteId &&
            routes.map((route) => {
              if (selectedRouteId === route.id) {
                let strokeColor;
                if (route.hasFlood) {
                  strokeColor = "red"; // Explicit Red for severe flood on selected route
                } else if (route.hasWarning) {
                  strokeColor = "yellow"; // Explicit Yellow for warning on selected route
                } else {
                  strokeColor = theme.colors.primary; // Use theme primary for normal selected route
                }
                return (
                  <Polyline
                    key={route.id}
                    coordinates={route.coordinates}
                    strokeColor={strokeColor}
                    strokeWidth={6} // Thicker line for selected
                    zIndex={1} // Bring to front
                  />
                );
              }
              // If selectedRouteId is not null, but this is not the selected route, do not render it.
              return null;
            })}
        </MapView>

        {/* Map Controls */}
        <View
          style={[
            styles.mapControlsContainer,
            { backgroundColor: theme.colors.card + "CC" },
          ]}
        >
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() =>
              setMapType(mapType === "standard" ? "satellite" : "standard")
            }
          >
            <Ionicons
              name={mapType === "standard" ? "map-outline" : "earth-outline"}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.mapControlsSeparator,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => {
              if (currentLocation)
                mapRef.current?.animateToRegion({
                  ...currentLocation,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                });
            }}
          >
            <Ionicons
              name="navigate-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          {/* Route Planning Icon - This is the icon you're looking for! */}
          {!isNavigating && currentLocation && destination && (
            <>
              <View
                style={[
                  styles.mapControlsSeparator,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={handleViewRoutesOnMap}
              >
                <Ionicons
                  name="git-compare-outline"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Stop Navigation Button (visible during navigation) */}
        {isNavigating && (
          <TouchableOpacity
            style={[
              styles.stopNavButton,
              { backgroundColor: theme.colors.severe },
            ]}
            onPress={stopNavigation}
          >
            <Text style={styles.stopNavButtonText}>Stop Navigation</Text>
          </TouchableOpacity>
        )}

        {/* Flood Alert (if applicable) */}
        {showFloodAlert && !isNavigating && (
          <View
            style={[
              styles.floodAlertContainer,
              { backgroundColor: theme.colors.caution + "CC" },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text style={[styles.floodAlertText, { color: theme.colors.text }]}>
              Flood detected on fastest route. Suggested alternative.
            </Text>
          </View>
        )}

        {/* Bottom Sheet for Directions */}
        {!isNavigating && (
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            backgroundStyle={{ backgroundColor: theme.colors.card }}
            handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                Directions
              </Text>
              <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={theme.colors.border}
                />
              </TouchableOpacity>
            </View>
            {renderTransportModes()}
            <BottomSheetScrollView
              contentContainerStyle={styles.sheetContentContainer}
            >
              <View
                style={[
                  styles.routeInputContainer,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                {/* "From" Input Field */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputRow}>
                    <Ionicons
                      name="navigate-circle-outline"
                      size={24}
                      color={theme.colors.primary}
                    />
                    <TextInput
                      style={[
                        styles.inputField,
                        {
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      placeholder={
                        isGettingCurrentLocation
                          ? "Getting current location..."
                          : "Your current location"
                      }
                      placeholderTextColor={theme.colors.text + "80"}
                      value={
                        isGettingCurrentLocation
                          ? "Getting current location..."
                          : fromAddressInput
                      }
                      onChangeText={handleFromInputChange}
                      onSubmitEditing={handleFromAddressSubmit}
                      returnKeyType="search"
                      editable={!isGettingCurrentLocation}
                      onFocus={() => setFromSuggestions([])}
                    />
                    {isGettingCurrentLocation ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                        style={{ marginLeft: 5 }}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={handleSetCurrentLocation}
                        style={{ marginLeft: 5 }}
                      >
                        <Ionicons
                          name="locate-outline"
                          size={24}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {isFetchingFromSuggestions && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.text}
                      style={{ marginTop: 5 }}
                    />
                  )}
                  {fromSuggestions.length > 0 && (
                    <ScrollView
                      style={[
                        styles.suggestionsList,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.background,
                        },
                      ]}
                      keyboardShouldPersistTaps="always"
                    >
                      {fromSuggestions.map((item, index) => (
                        <TouchableOpacity
                          key={
                            item.osm_id
                              ? item.osm_id.toString()
                              : index.toString()
                          }
                          style={[
                            styles.suggestionItem,
                            { borderBottomColor: theme.colors.border },
                          ]}
                          onPress={() => selectFromSuggestion(item)}
                        >
                          <Text
                            style={[
                              styles.suggestionText,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.display_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.colors.border },
                  ]}
                />

                {/* "Where To?" Input Field */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputRow}>
                    <Ionicons
                      name="map-outline"
                      size={24}
                      color={theme.colors.accent}
                      style={{ marginLeft: 2 }}
                    />
                    <TextInput
                      style={[
                        styles.inputField,
                        {
                          color: theme.colors.text,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      placeholder={resolvedDestinationName}
                      placeholderTextColor={theme.colors.text + "80"}
                      value={destinationInput}
                      onChangeText={handleToInputChange}
                      onSubmitEditing={handleDestinationSubmit}
                      returnKeyType="search"
                      clearButtonMode="while-editing"
                      onFocus={() => setToSuggestions([])}
                    />
                    {isFetchingToSuggestions && (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.text}
                        style={{ marginLeft: 5 }}
                      />
                    )}
                    {destinationInput.length > 0 &&
                      !isFetchingToSuggestions && (
                        <TouchableOpacity
                          onPress={() => {
                            setDestinationInput("");
                            setDestination(null);
                            setResolvedDestinationName(
                              "Tap on map or search for destination"
                            );
                            setRoutes([]);
                            setSelectedRouteId(null);
                            setToSuggestions([]);
                          }}
                          style={{ marginLeft: 5 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={theme.colors.border}
                          />
                        </TouchableOpacity>
                      )}
                  </View>
                  {toSuggestions.length > 0 && (
                    <ScrollView
                      style={[
                        styles.suggestionsList,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.background,
                        },
                      ]}
                      keyboardShouldPersistTaps="always"
                    >
                      {toSuggestions.map((item, index) => (
                        <TouchableOpacity
                          key={
                            item.osm_id
                              ? item.osm_id.toString()
                              : index.toString()
                          }
                          style={[
                            styles.suggestionItem,
                            { borderBottomColor: theme.colors.border },
                          ]}
                          onPress={() => selectToSuggestion(item)}
                        >
                          <Text
                            style={[
                              styles.suggestionText,
                              { color: theme.colors.text },
                            ]}
                          >
                            {item.display_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {isFindingRoute ? (
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary}
                  style={{ marginTop: 40 }}
                />
              ) : routes.length === 0 &&
                (destination ||
                  fromAddressInput.length > 0 ||
                  destinationInput.length > 0) ? (
                <Text
                  style={[styles.noRoutesText, { color: theme.colors.text }]}
                >
                  No routes found. Please check your inputs or try adjusting
                  them.
                </Text>
              ) : routes.length === 0 &&
                !destination &&
                !fromAddressInput &&
                !destinationInput ? (
                <Text
                  style={[styles.noRoutesText, { color: theme.colors.text }]}
                >
                  Enter your starting point and destination above, or tap on the
                  map to set a destination.
                </Text>
              ) : (
                routes.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={[
                      styles.routeItem,
                      { backgroundColor: theme.colors.background },
                      // Border color logic based on selected status and route condition
                      selectedRouteId === route.id &&
                        (route.hasFlood
                          ? {
                              borderColor: theme.colors.severe,
                              backgroundColor: theme.colors.severe + "1A",
                            }
                          : route.hasWarning
                          ? {
                              borderColor: theme.colors.caution,
                              backgroundColor: theme.colors.caution + "1A",
                            }
                          : {
                              borderColor: theme.colors.primary,
                              backgroundColor: theme.colors.primary + "1A",
                            }),
                    ]}
                    onPress={() => setSelectedRouteId(route.id)}
                  >
                    <View style={styles.routeInfo}>
                      <Text
                        style={[
                          styles.routeDuration,
                          { color: theme.colors.text },
                        ]}
                      >
                        {route.duration}
                      </Text>
                      <Text
                        style={[
                          styles.routeDetails,
                          { color: theme.colors.text + "B3" },
                        ]}
                      >
                        {route.eta} • {route.distance}
                      </Text>
                      <Text
                        style={[
                          styles.routeTitle,
                          { color: theme.colors.text },
                        ]}
                      >
                        {route.title}
                        {route.hasFlood && (
                          <Ionicons
                            name="alert-circle"
                            size={16}
                            color={theme.colors.severe}
                            style={{ marginLeft: 5 }}
                          />
                        )}
                        {route.hasWarning && !route.hasFlood && (
                          <Ionicons
                            name="warning"
                            size={16}
                            color={theme.colors.caution}
                            style={{ marginLeft: 5 }}
                          />
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.goButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={startNavigation}
                    >
                      <Text style={styles.goButtonText}>GO</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </BottomSheetScrollView>
          </BottomSheet>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userLocationPuck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.5,
  },
  destinationMarker: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  mapControlsContainer: {
    position: "absolute",
    top: 60,
    right: 15,
    borderRadius: 8,
    overflow: "hidden",
  },
  mapControlButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mapControlsSeparator: {
    height: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  transportContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  transportButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  routeInputContainer: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    zIndex: 1,
  },
  inputWrapper: {
    position: "relative",
    zIndex: 1,
    paddingBottom: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
    marginLeft: 36,
  },
  suggestionsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 5,
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    zIndex: 100,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 14,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  routeInfo: {
    flex: 1,
  },
  routeDuration: {
    fontSize: 20,
    fontWeight: "bold",
  },
  routeDetails: {
    fontSize: 14,
    marginVertical: 4,
  },
  routeTitle: {
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  goButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 15,
  },
  goButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  stopNavButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 120 : 80,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  stopNavButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  floodAlertContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 120 : 80,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  floodAlertText: {
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 14,
  },
  noRoutesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default MapScreen;
