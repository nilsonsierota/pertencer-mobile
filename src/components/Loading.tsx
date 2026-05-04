import { View, Image, StyleSheet } from "react-native";

export function Loading() {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/Logo. 25 [GIF].gif")} style={styles.gif} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#189E50',
  },
  gif: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});