import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { AppConfig } from "../config/config";
import { loadUserFromStorage, saveUserToStorage } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

export default function OrderPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(AppConfig.flavor, resolvedMode);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dob: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    dispatch(loadUserFromStorage() as any);
  }, [dispatch]);

  // Get user from store at top level (hooks must be called at top level)
  const user = useAppSelector((state) => state.auth.user);

  // Update form with loaded user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        email: user.email,
      });
    }
  }, [user]);

  // If logged in, redirect to menu
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace("/menu");
    }
  }, [loading, isLoggedIn, router]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Last name is required");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Alert.alert("Error", "Valid phone number is required");
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert("Error", "Address is required");
      return false;
    }
    if (!formData.dob.trim()) {
      Alert.alert("Error", "Date of birth is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      Alert.alert("Error", "Valid email is required");
      return false;
    }
    return true;
  };

  const handleOrderNow = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(saveUserToStorage(formData) as any);
      router.replace("/menu");
    } catch (error) {
      Alert.alert("Error", "Failed to save order details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(saveUserToStorage(formData) as any);
      router.replace("/menu");
    } catch (error) {
      Alert.alert("Error", "Failed to signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show form only after clicking Order Now
  if (!showForm) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <LinearGradient
          colors={[
            theme.primary + "20",
            theme.accent + "10",
          ]}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.orderContainer}>
          <View style={styles.orderCard}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="restaurant-outline" size={48} color="#FFF" />
            </View>
            
            <Text style={[styles.orderTitle, { color: theme.text }]}>
              Ready to Order?
            </Text>
            
            <Text style={[styles.orderSubtitle, { color: theme.text + "80" }]}>
              Please fill in your details to get started with your food order.
            </Text>

            <Pressable
              style={[styles.orderButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.orderButtonText}>Order Now</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => setShowForm(false)}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            Enter Your Details
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              First Name
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text }]}
              placeholder="Enter first name"
              placeholderTextColor={theme.text + "80"}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Last Name
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text }]}
              placeholder="Enter last name"
              placeholderTextColor={theme.text + "80"}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Phone Number
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text }]}
              placeholder="Enter phone number"
              placeholderTextColor={theme.text + "80"}
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Address
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text, height: 80, textAlignVertical: "top" }]}
              placeholder="Enter address"
              placeholderTextColor={theme.text + "80"}
              value={formData.address}
              onChangeText={(value) => handleInputChange("address", value)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* DOB */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Date of Birth
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text }]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={theme.text + "80"}
              value={formData.dob}
              onChangeText={(value) => handleInputChange("dob", value)}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>
              Email ID
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.muted, color: theme.text }]}
              placeholder="Enter email"
              placeholderTextColor={theme.text + "80"}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Order Now Button */}
          <Pressable
            style={[styles.orderButton, { backgroundColor: theme.primary }]}
            onPress={handleOrderNow}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.orderButtonText}>Order Now</Text>
            )}
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            style={[styles.signupButton, { borderColor: theme.primary }]}
            onPress={handleSignup}
            disabled={isSubmitting}
          >
            <Text style={[styles.signupButtonText, { color: theme.primary }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  orderCard: {
    backgroundColor: "transparent",
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  orderTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  orderSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  orderButton: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  signupButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    marginTop: 8,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

