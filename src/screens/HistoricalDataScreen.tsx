"use client"

import React, { useContext, useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"
import { LineChart, BarChart } from "react-native-chart-kit"
import { getBaseURL } from "../config/api"

type FloodRecord = {
  id: number
  year: number
  month: number
  barangay: string
  flood_depth_m: number
  duration_hours: number
  cause: string
}

const chartConfig = (theme: any, colorOverride?: string) => ({
  backgroundColor: theme.colors.card,
  backgroundGradientFrom: theme.colors.card,
  backgroundGradientTo: theme.colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => colorOverride || `rgba(128, 128, 128, ${opacity})`,
  labelColor: (opacity = 1) => theme.colors.text,
  propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary },
  barPercentage: 0.7,
})

const FloodDepthAnalysisChart = ({ data, theme }: { data: FloodRecord[]; theme: any }) => {
  const categories = { Shallow: 0, Moderate: 0, Deep: 0 }
  data.forEach((record) => {
    if (record.flood_depth_m < 0.5) categories.Shallow++
    else if (record.flood_depth_m <= 1.5) categories.Moderate++
    else categories.Deep++
  })

  const chartData = {
    labels: Object.keys(categories),
    datasets: [{ data: Object.values(categories) }],
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Flood Depth Analysis</Text>
      <BarChart
        data={chartData}
        width={Dimensions.get("window").width - 64}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" reports"
        chartConfig={chartConfig(theme, theme.colors.primary)}
        fromZero
        showValuesOnTopOfBars
      />
    </View>
  )
}

const TimelineChart = ({ data, theme }: { data: FloodRecord[]; theme: any }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const reportsByMonth = new Map<string, number>()

  data
    .slice()
    .sort((a, b) => a.month - b.month)
    .forEach((record) => {
      const monthName = monthNames[record.month - 1]
      reportsByMonth.set(monthName, (reportsByMonth.get(monthName) || 0) + 1)
    })

  const chartData = {
    labels: [...reportsByMonth.keys()],
    datasets: [{ data: [...reportsByMonth.values()] }],
  }

  if (chartData.labels.length === 0) return null

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Monthly Flood Trends</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 64}
        height={220}
        yAxisSuffix=" reports"
        chartConfig={chartConfig(theme, theme.colors.primary)}
        bezier
        fromZero
      />
    </View>
  )
}

const HorizontalBarangayChart = ({ data, theme }: { data: FloodRecord[]; theme: any }) => {
  const reportsByBarangay = data.reduce((acc, record) => {
    acc[record.barangay] = (acc[record.barangay] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedBarangays = Object.entries(reportsByBarangay).sort((a, b) => b[1] - a[1])

  if (sortedBarangays.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Affected Barangays</Text>
        <Text style={styles.noDataText}>No flood data to display for this year.</Text>
      </View>
    )
  }

  const maxValue = Math.max(...sortedBarangays.map((b) => b[1]))

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Affected Barangays</Text>
      <View style={styles.hBarChartContainer}>
        {sortedBarangays.map(([name, value]) => (
          <View key={name} style={styles.hBarRow}>
            <Text style={[styles.hBarLabel, { color: theme.colors.text }]}>{name}</Text>
            <View style={styles.hBar}>
              <View
                style={[
                  styles.hBarFill,
                  { backgroundColor: theme.colors.primary, width: `${(value / maxValue) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.hBarValue, { color: theme.colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const YearSelector = ({ selectedYear, setSelectedYear }: { selectedYear: number; setSelectedYear: (year: number) => void }) => {
  const { theme } = useContext(ThemeContext)
  const years = [2023, 2024, 2025]

  return (
    <View style={styles.yearSelectorContainer}>
      {years.map((year) => (
        <TouchableOpacity
          key={year}
          style={[
            styles.yearButton,
            {
              backgroundColor: selectedYear === year ? theme.colors.primary : theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setSelectedYear(year)}
        >
          <Text style={{ color: selectedYear === year ? "#fff" : theme.colors.text, fontWeight: "600" }}>
            {year}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const HistoricalDataScreen = () => {
  const { theme } = useContext(ThemeContext)
  const [allRecords, setAllRecords] = useState<FloodRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = getBaseURL()
        const recordsRes = await fetch(`${API_BASE_URL}/flood-records`)

        if (!recordsRes.ok) throw new Error("Failed to fetch data from the server.")

        const recordsData = await recordsRes.json()
        setAllRecords(recordsData)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredRecords = allRecords.filter((record) => {
    if (selectedYear === 2025) {
      const currentMonth = new Date().getMonth() + 1
      return record.year === 2025 && record.month <= currentMonth
    }
    return record.year === selectedYear
  })

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>Loading Historical Data...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color={theme.colors.text} />
        <Text style={styles.errorText}>Error Fetching Data</Text>
        <Text style={styles.errorSubText}>{error}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Historical Data & Insights</Text>
        <YearSelector selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
        <TimelineChart data={filteredRecords} theme={theme} />
        <HorizontalBarangayChart data={filteredRecords} theme={theme} />
        <FloodDepthAnalysisChart data={filteredRecords} theme={theme} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  errorText: { marginTop: 16, fontSize: 18, fontWeight: "600", textAlign: "center" },
  errorSubText: { marginTop: 8, fontSize: 14, textAlign: "center", opacity: 0.8 },
  yearSelectorContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  yearButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1 },
  noDataText: { color: "#666", textAlign: "center", paddingVertical: 40, fontStyle: "italic" },
  hBarChartContainer: { paddingVertical: 10 },
  hBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  hBarLabel: { width: 80, fontSize: 12 },
  hBar: { flex: 1, height: 20, backgroundColor: "#eee", borderRadius: 10, overflow: "hidden" },
  hBarFill: { height: "100%", borderRadius: 10 },
  hBarValue: { width: 30, fontSize: 12, textAlign: "right", fontWeight: "bold" },
})

export default HistoricalDataScreen
