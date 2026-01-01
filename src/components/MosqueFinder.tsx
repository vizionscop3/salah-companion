/**
 * Mosque Finder Component - Material Neubrutomorphism
 *
 * Search and find nearby mosques with Material Neubrutomorphism design.
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import {NeubrutalCard, NeubrutalButton} from './index';
import {spacing, typography, colors, borderRadius, brutalistShadows} from '@constants/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Mosque {
  id: number;
  name: string;
  address: string;
  distance: string;
  latitude?: number;
  longitude?: number;
}

export interface MosqueFinderProps {
  onMosqueSelect?: (mosque: Mosque) => void;
}

export const MosqueFinder: React.FC<MosqueFinderProps> = ({onMosqueSelect}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  // Mock data - replace with actual API call
  const mosques: Mosque[] = [
    {
      id: 1,
      name: 'Raleigh Islamic Institute',
      address: '3209 Gresham Lake Rd, #131, Raleigh, NC, USA 27615',
      distance: '2.3 km',
    },
  ];

  const filteredMosques = mosques.filter(
    (mosque) =>
      mosque.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mosque.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMosqueSelect = (mosque: Mosque) => {
    setSelectedMosque(mosque);
    onMosqueSelect?.(mosque);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Search Bar */}
      <NeubrutalCard style={styles.searchBar} shadowSize="small">
        <View style={styles.searchContent}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.primary.main} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by mosjid..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <MaterialCommunityIcons name="close" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </NeubrutalCard>

      {/* Map Container */}
      <NeubrutalCard style={styles.mapContainer} shadowSize="medium">
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapOverlay}>
            <MaterialCommunityIcons name="map-marker" size={40} color={colors.primary.main} />
          </View>
        </View>
      </NeubrutalCard>

      {/* Mosque Cards */}
      <View style={styles.mosqueList}>
        {filteredMosques.map((mosque) => (
          <NeubrutalCard key={mosque.id} style={styles.mosqueCard} shadowSize="small">
            <View style={styles.mosqueContent}>
              <View style={styles.mosqueInfo}>
                <Text style={styles.mosqueName}>{mosque.name}</Text>
                <Text style={styles.mosqueAddress}>{mosque.address}</Text>
              </View>
              <View style={styles.mosqueActions}>
                <NeubrutalButton
                  title="Set"
                  onPress={() => handleMosqueSelect(mosque)}
                  size="small"
                  variant="primary"
                />
                <View style={styles.mosqueDistance}>
                  <MaterialCommunityIcons
                    name="map-marker-distance"
                    size={16}
                    color={colors.primary.main}
                  />
                  <Text style={styles.distanceText}>{mosque.distance}</Text>
                </View>
              </View>
            </View>
          </NeubrutalCard>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  searchBar: {
    padding: spacing.sm,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 300,
    padding: 0,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosqueList: {
    gap: spacing.sm,
  },
  mosqueCard: {
    padding: spacing.md,
  },
  mosqueContent: {
    gap: spacing.sm,
  },
  mosqueInfo: {
    gap: spacing.xs,
  },
  mosqueName: {
    ...typography.h5,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: 'Poppins',
  },
  mosqueAddress: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  mosqueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  mosqueDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distanceText: {
    ...typography.body2,
    color: colors.text.secondary,
  },
});

