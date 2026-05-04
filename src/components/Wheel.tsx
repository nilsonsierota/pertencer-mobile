"use client";

import { useState, useRef, useEffect } from "react";
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
  initialSelectedId?: string | null;
  todayItemId?: string | null;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 60;

export function Wheel({ items, onPress, isBooks = false, showProgress = false, itemColor = '#1b2b1b', loading = false, initialSelectedId, todayItemId }: WheelProps) {
  const [selected, setSelected] = useState<string | null>(initialSelectedId || (items.length > 0 ? items[0].id : null));
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initialSelectedId && scrollRef.current) {
      const index = items.findIndex(i => i.id === initialSelectedId);
      if (index >= 0) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
        }, 100);
      }
    }
  }, [initialSelectedId, items]);

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
        scrollEnabled={!loading}
      >
        <View style={{ height: screenHeight * 0.3 }} />
        
        {items.map((item) => {
          const isSelected = item.id === selected;
          const isToday = item.id === todayItemId;
          
           let itemStyle: any = styles.itemDefault;
           let innerItemStyle: any = {};
           
           if (isToday) {
             itemStyle = styles.itemTodayOuter;
             innerItemStyle = styles.itemTodayInner;
           } else if (isSelected) {
             itemStyle = styles.itemSelected;
           }
          
          return (
             <Pressable
               key={item.id}
               onPress={() => handlePress(item)}
               style={itemStyle}
             >
                {isToday ? (
                  <View style={innerItemStyle}>
                ) : null}
               <Text style={[{ color: isSelected ? '#FFFFFF' : '#000000', fontWeight: isSelected ? 'bold' : '600' }]}>
                 {item.title}
               </Text>
               {showProgress && isBooks && item.donePercentage !== undefined && (
                 <Text style={[{ fontSize: 11, marginTop: 2, color: isSelected ? '#189E50' : '#000000' }]}>
                   {item.donePercentage}% ({item.doneChapters}/{item.totalChapters})
                 </Text>
               )}
               {loading && isSelected && (
                 <ActivityIndicator size="small" color="#189E50" style={{ marginTop: 4 }} />
               )}
                {isToday ? (
                  </View>
                ) : null}
             </Pressable>
          );
        })}
        
        <View style={{ height: screenHeight * 0.4 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
  },
  item: {
    width: screenWidth - 60,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 3,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
   itemSelected: {
     width: screenWidth - 60,
     height: ITEM_HEIGHT,
     justifyContent: 'center',
     alignItems: 'center',
     borderRadius: 12,
     marginVertical: 3,
     backgroundColor: '#273107',
     borderWidth: 2,
     borderColor: '#189E50',
   },
   itemTodayOuter: {
     width: screenWidth - 60,
     height: ITEM_HEIGHT,
     borderRadius: 8,
     marginVertical: 3,
     borderWidth: 3,
     borderColor: '#0F5D2B',
   },
   itemTodayInner: {
     width: screenWidth - 68, // 60 - 4*2 (2px on each side)
     height: ITEM_HEIGHT - 8, // 60 - 4*2 (2px on each side)
     justifyContent: 'center',
     alignItems: 'center',
     borderRadius: 6, // 8 - 2
     backgroundColor: '#0F5D2B',
   },
   itemDefault: {
     width: screenWidth - 60,
     height: ITEM_HEIGHT,
     justifyContent: 'center',
     alignItems: 'center',
     borderRadius: 12,
     marginVertical: 3,
     backgroundColor: 'transparent',
     borderWidth: 1,
     borderColor: '#CCCCCC',
   },
});