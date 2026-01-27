import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { AppConfig } from "../config/config";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { clearCart } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

const funnyMessages = [
  "🍕 Your pizza is feeling nervous... in a good way!",
  "🍔 The chef just got a little more handsome. Blame your order!",
  "🌮 Taco 'bout a great choice! Your food is on the way!",
  "🍣 Wasabi you waiting for? It's coming!",
  "🥗 Healthy eating wins! Your greens are being chopped!",
  "🍜 Noodle-itate on how amazing this meal will be!",
  "🍩 You'll thank yourself later. We promise!",
  "🍳 You're egg-cellent! Your order is being cooked!",
  "🥐 This is un-brie-lievable! Your croissants are warming up!",
  "🍖 Meat you halfway there! Grilling your order now!",
];

function getRandomMessage(): string {
  return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
}

interface SuccessViewProps {
  theme: ReturnType<typeof getTheme>;
}

function SuccessView({ theme }: SuccessViewProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [message] = React.useState(getRandomMessage());

  // Use accent color as success color, with a darker variant for gradients
  const successColor = theme.accent;
  const successColorDark = theme.primary;

  // Generate confetti colors from theme
  const confettiColors = [
    theme.primary,
    theme.accent,
    successColor,
    theme.text,
    theme.muted,
  ];

  useEffect(() => {
    // Pop-in animation for success icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Fade in for main content
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Delayed message animation
    setTimeout(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  return (
    <View style={styles.successContainer}>
      {/* Animated success icon */}
      <Animated.View
        style={[
          styles.iconWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={[successColor, successColorDark]}
          style={styles.successIcon}
        >
          <Ionicons name="checkmark" size={60} color="#FFF" />
        </LinearGradient>
      </Animated.View>

      {/* Main text */}
      <Animated.View style={{ opacity: opacityAnim }}>
        <Text style={[styles.successTitle, { color: successColor }]}>
          Order Placed Successfully!
        </Text>
        <Text style={[styles.successSubtitle, { color: theme.text }]}>
          🎉 Your delicious meal is being prepared with love!
        </Text>
      </Animated.View>

      {/* Funny message */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: messageOpacity,
            backgroundColor: theme.muted,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.funnyMessage, { color: theme.text }]}>
          {message}
        </Text>
      </Animated.View>

      {/* Confetti effect */}
      <View style={styles.confettiContainer}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${5 + i * 9}%`,
                backgroundColor: confettiColors[i % confettiColors.length],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function OrderSuccessPage() {
  const { safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  const handleOrderAgain = () => {
    try {
      dispatch(clearCart());
      Loggers.cart.info("Cart cleared, navigating to menu");
      safePush("menu");
    } catch (error) {
      Loggers.cart.error("Failed to order again", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SuccessView theme={theme} />

      {/* Order Again Button */}
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={[theme.primary, theme.accent]}
          style={styles.orderButton}
        >
          <Pressable
            onPress={handleOrderAgain}
            style={styles.pressable}
          >
            <Ionicons name="restaurant" size={22} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.orderButtonText}>Order More Food</Text>
          </Pressable>
        </LinearGradient>

        <Pressable
          onPress={() => {
            dispatch(clearCart());
            router.replace("/");
          }}
          style={styles.homeButton}
        >
          <Text style={[styles.homeButtonText, { color: theme.text }]}>
            Go to Home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 24,
  },
  messageContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  funnyMessage: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    fontStyle: "italic",
  },
  confettiContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    height: 200,
    overflow: "hidden",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  orderButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  homeButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default memo(OrderSuccessPage);

