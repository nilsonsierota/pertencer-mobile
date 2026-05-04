"use client";

import { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";

interface WheelItem {
  id: string;
  title: string;
  donePercentage?: number;
  doneChapters?: number;
  totalChapters?: number;
}

interface WheelProps {
  items: WheelItem[];
  onPress: (item: any) => void;
  isBooks?: boolean;
  showProgress?: boolean;
  itemColor?: string;
  loading?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 50;

export function Wheel({ items, onPress, isBooks = false, showProgress = false, itemColor = '#1b2b1b', loading = false }: WheelProps) {
  const [selected, setSelected] = useState<string | null>(items.length > 0 ? items[0].id : null);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      setSelected(items[index].id);
    }
  };

  const handlePress = (item: WheelItem) => {
    const index = items.findIndex(i => i.id === item.id);
    setSelected(item.id);
    
    scrollRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true
    });
    
    onPress(item);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
      >
        <View style={{ height: screenHeight * 0.35 }} />
        
        {items.map((item) => {
          const isSelected = item.id === selected;
          return (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item)}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected, !isSelected && { color: itemColor }]}>
                {item.title}
              </Text>
              {showProgress && isBooks && item.donePercentage !== undefined && (
                <Text style={[styles.progressText, isSelected && styles.progressTextSelected]}>
                  {item.donePercentage}% ({item.doneChapters}/{item.totalChapters})
                </Text>
              )}
              {loading && isSelected && (
                <ActivityIndicator size="small" color="#189E50" style={styles.loader} />
              )}
            </Pressable>
          );
        })}
        
        <View style={{ height: screenHeight * 0.5 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  item: {
    width: screenWidth - 40,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 3,
  },
  itemSelected: {
    backgroundColor: '#273107',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemTitleSelected: {
    color: '#FFFFFF',
  },
  progressText: {
    fontSize: 12,
    marginTop: 2,
  },
  progressTextSelected: {
    color: '#189E50',
  },
  loader: {
    marginTop: 4,
  },
});