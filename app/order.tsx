import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage, saveUserToStorage } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getTheme } from "../theme";
import { showError } from "../utils/alertUtils";
import { AuthMessages } from "../utils/errorMessages";
import { Loggers } from "../utils/logger";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

// Memoized form input component to reduce re-renders
const FormInput = memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  placeholderTextColor, 
  keyboardType, 
  maxLength, 
  multiline, 
  style, 
  theme 
}: any) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.label, { color: theme.text }]}>
      {label}
    </Text>
    <TextInput
      style={[styles.input, { backgroundColor: theme.muted, color: theme.text }, style]}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      multiline={multiline}
    />
  </View>
));

// Memoized initial view component
const OrderInitialView = memo(({ theme, onOrderPress }: { theme: any; onOrderPress: () => void }) => (
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
          onPress={onOrderPress}
        >
          <Text style={styles.orderButtonText}>Order Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </View>
  </View>
));

// Main component
function OrderPage() {
  const { safeReplace } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const loading = useAppSelector((state) => state.auth.loading);
  const user = useAppSelector((state) => state.auth.user);
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

  // If logged in, redirect to menu using safe navigation
  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.replace('/menu');
    }
  }, [loading, isLoggedIn]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.firstName.trim()) {
      showError("Validation Error", AuthMessages.validation.firstNameRequired);
      return false;
    }
    if (!formData.lastName.trim()) {
      showError("Validation Error", AuthMessages.validation.lastNameRequired);
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      showError("Validation Error", AuthMessages.validation.phoneInvalid);
      return false;
    }
    if (!formData.address.trim()) {
      showError("Validation Error", AuthMessages.validation.addressRequired);
      return false;
    }
    if (!formData.dob.trim()) {
      showError("Validation Error", AuthMessages.validation.dobRequired);
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      showError("Validation Error", AuthMessages.validation.emailInvalid);
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(saveUserToStorage(formData) as any);
      // Use router to navigate to menu page
      router.replace('/menu');
    } catch (error) {
      Loggers.auth.error("Signup failed", error);
      showError("Error", AuthMessages.errors.saveUserFailed);
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, formData, validateForm]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Show form only after clicking Order Now
  if (!showForm) {
    return <OrderInitialView theme={theme} onOrderPress={() => setShowForm(true)} />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => setShowForm(false)}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>
            Sign Up
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
              returnKeyType="next"
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
              returnKeyType="next"
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
              returnKeyType="next"
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
              returnKeyType="next"
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
              returnKeyType="next"
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
              returnKeyType="done"
            />
          </View>

          {/* Sign Up Button */}
          <Pressable
            style={[styles.orderButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.orderButtonText}>Sign Up</Text>
            )}
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
    minHeight: "100%",
    flexGrow: 1,
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
});

// Export memoized component to prevent unnecessary re-renders
export default memo(OrderPage);

