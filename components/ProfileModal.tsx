import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { UserData, saveUserToStorage, updateUser } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";
import { showError } from "../utils/alertUtils";
import { Loggers } from "../utils/logger";
import {
  sanitizeInput,
  validateDOB,
  validateEmail,
  validateMinLength,
  validatePhone,
  validateRequired,
} from "../utils/validation";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserData | null;
  onLogout: () => void;
  theme: {
    background: string;
    primary: string;
    accent: string;
    text: string;
    muted: string;
    card: string[] | [string, string, ...string[]];
    border: string;
  };
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  theme: any;
  keyboardType?: "default" | "email-address" | "phone-pad";
  placeholder?: string;
  error?: string;
  showError?: boolean;
  onBlur?: () => void;
}

const ProfileField = ({
  label,
  value,
  onChangeText,
  editable,
  theme,
  keyboardType = "default",
  placeholder,
  error,
  showError,
  onBlur,
}: FieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: theme.accent }]}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        {
          color: theme.text,
          backgroundColor: editable 
            ? (Array.isArray(theme.card) ? theme.card[0] : theme.card) 
            : theme.muted + "30",
          borderColor: showError && error ? theme.primary : theme.border,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.text + "60"}
      onBlur={onBlur}
    />
    {showError && error && (
      <Text style={[styles.errorText, { color: theme.primary }]}>
        {error}
      </Text>
    )}
  </View>
);

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  email?: string;
}

// Loading placeholder component
const LoadingPlaceholder = ({ theme }: { theme: any }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.primary} />
    <Text style={[styles.loadingText, { color: theme.text, marginTop: 16 }]}>
      Loading profile...
    </Text>
  </View>
);

// Main form content component
const ProfileFormContent = ({
  formData,
  formErrors,
  touchedFields,
  isEditing,
  theme,
  onInputChange,
  onBlur,
  onEditPress,
  onCancel,
  onSave,
  onLogout,
  user,
}: {
  formData: UserData;
  formErrors: FormErrors;
  touchedFields: Record<string, boolean>;
  isEditing: boolean;
  theme: any;
  onInputChange: (field: keyof UserData, value: string) => void;
  onBlur: (field: keyof UserData) => void;
  onEditPress: () => void;
  onCancel: () => void;
  onSave: () => void;
  onLogout: () => void;
  user: UserData | null;
}) => (
  <>
    {/* Header */}
    <View style={styles.modalHeader}>
      <Text style={[styles.modalTitle, { color: theme.text }]}>
        Profile
      </Text>
      <Pressable onPress={() => {}} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={theme.text} />
      </Pressable>
    </View>

    {/* Profile Header */}
    <View style={styles.profileHeader}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons name="person" size={40} color="#FFF" />
      </View>
      <Text style={[styles.userName, { color: theme.text }]}>
        {formData.firstName} {formData.lastName}
      </Text>

      {/* Profile Info Summary */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={14} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={1}>
              {formData.email}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={14} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              {formData.phone}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoItem, { flex: 1 }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              DOB: {formData.dob}
            </Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color={theme.accent} />
            <Text style={[styles.infoText, { color: theme.text }]} numberOfLines={2}>
              {formData.address}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() =>
          isEditing ? onCancel() : onEditPress()
        }
        style={[
          styles.editButton,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons
          name={isEditing ? "close-outline" : "create-outline"}
          size={16}
          color="#FFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.editButtonText}>
          {isEditing ? "Cancel" : "Edit"}
        </Text>
      </Pressable>
    </View>

    {/* Form Fields */}
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.fieldsContainer}>
        <View style={styles.row}>
          <View style={[styles.fieldWrapper, { marginRight: 8 }]}>
            <ProfileField
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => onInputChange("firstName", text)}
              editable={isEditing}
              theme={theme}
              placeholder="Enter first name"
              error={formErrors.firstName}
              showError={touchedFields.firstName && isEditing}
              onBlur={() => onBlur("firstName")}
            />
          </View>
          <View style={[styles.fieldWrapper, { marginLeft: 8 }]}>
            <ProfileField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => onInputChange("lastName", text)}
              editable={isEditing}
              theme={theme}
              placeholder="Enter last name"
              error={formErrors.lastName}
              showError={touchedFields.lastName && isEditing}
              onBlur={() => onBlur("lastName")}
            />
          </View>
        </View>

        <ProfileField
          label="Email"
          value={formData.email}
          onChangeText={(text) => onInputChange("email", text)}
          editable={isEditing}
          theme={theme}
          keyboardType="email-address"
          placeholder="Enter email"
          error={formErrors.email}
          showError={touchedFields.email && isEditing}
          onBlur={() => onBlur("email")}
        />

        <ProfileField
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => onInputChange("phone", text)}
          editable={isEditing}
          theme={theme}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          error={formErrors.phone}
          showError={touchedFields.phone && isEditing}
          onBlur={() => onBlur("phone")}
        />

        <ProfileField
          label="Date of Birth"
          value={formData.dob}
          onChangeText={(text) => onInputChange("dob", text)}
          editable={isEditing}
          theme={theme}
          placeholder="DD/MM/YYYY"
          error={formErrors.dob}
          showError={touchedFields.dob && isEditing}
          onBlur={() => onBlur("dob")}
        />

        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: theme.accent }]}>
            Address
          </Text>
          <TextInput
            style={[
              styles.fieldInput,
              styles.addressInput,
              {
                color: theme.text,
                backgroundColor: isEditing
                  ? (Array.isArray(theme.card) ? theme.card[0] : theme.card)
                  : theme.muted + "30",
                borderColor: touchedFields.address && isEditing && formErrors.address 
                  ? theme.primary 
                  : theme.border,
              },
            ]}
            value={formData.address}
            onChangeText={(text) => onInputChange("address", text)}
            editable={isEditing}
            multiline
            textAlignVertical="top"
            placeholder="Enter address"
            placeholderTextColor={theme.text + "60"}
            onBlur={() => onBlur("address")}
          />
          {touchedFields.address && isEditing && formErrors.address && (
            <Text style={[styles.errorText, { color: theme.primary }]}>
              {formErrors.address}
            </Text>
          )}
        </View>

        {/* Spacing for logout button */}
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>

    {/* Action Buttons */}
    {isEditing && (
      <View style={styles.actionButtons}>
        <Pressable
          onPress={onCancel}
          style={[
            styles.cancelButton,
            { borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cancelButtonText, { color: theme.text }]}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          onPress={onSave}
          style={[
            styles.saveButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    )}

    {/* Logout Button */}
    {!isEditing && (
      <View style={styles.logoutContainer}>
        <Pressable
          onPress={onLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: theme.primary + "15" },
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.logoutText, { color: theme.primary }]}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    )}
  </>
);

export default function ProfileModal({
  visible,
  onClose,
  user,
  onLogout,
  theme,
}: ProfileModalProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    // Reset form data when modal opens with user data
    if (visible) {
      if (user) {
        setFormData(user);
      } else {
        // If modal is open but no user, initialize with empty data
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          dob: "",
          email: "",
        });
      }
      setFormErrors({});
      setTouchedFields({});
      setIsEditing(false);
    }
  }, [visible, user]);

  // Validate a single field and return error message if any
  const validateSingleField = useCallback((field: keyof UserData, value: string): string | undefined => {
    switch (field) {
      case "firstName": {
        const requiredResult = validateRequired(value.trim(), "First name");
        if (!requiredResult.isValid) return requiredResult.error;
        const minLengthResult = validateMinLength(value.trim(), "First name", 2);
        if (!minLengthResult.isValid) return minLengthResult.error;
        return undefined;
      }
      case "lastName": {
        const requiredResult = validateRequired(value.trim(), "Last name");
        if (!requiredResult.isValid) return requiredResult.error;
        const minLengthResult = validateMinLength(value.trim(), "Last name", 2);
        if (!minLengthResult.isValid) return minLengthResult.error;
        return undefined;
      }
      case "phone": {
        const phoneResult = validatePhone(value.trim(), "Phone number", 10);
        return phoneResult.isValid ? undefined : phoneResult.error;
      }
      case "address": {
        // Address is NOT trimmed to allow spaces after words
        const requiredResult = validateRequired(value, "Address");
        if (!requiredResult.isValid) return requiredResult.error;
        return undefined;
      }
      case "dob": {
        const dobResult = validateDOB(value.trim());
        return dobResult.isValid ? undefined : dobResult.error;
      }
      case "email": {
        const emailResult = validateEmail(value.trim(), "Email");
        return emailResult.isValid ? undefined : emailResult.error;
      }
      default:
        return undefined;
    }
  }, []);

  // Handle input change with validation
  const handleInputChange = useCallback((field: keyof UserData, value: string) => {
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => prev ? { ...prev, [field]: sanitizedValue } : null);
    
    // If field was touched, validate it
    if (touchedFields[field] && formData) {
      const error = validateSingleField(field, sanitizedValue);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [touchedFields, validateSingleField, formData]);

  // Mark field as touched when user leaves it
  const handleBlur = useCallback((field: keyof UserData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    if (formData) {
      const error = validateSingleField(field, formData[field]);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [formData, validateSingleField]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!formData) return false;
    
    const errors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof UserData>).forEach((field) => {
      const error = validateSingleField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    setTouchedFields((prev) => {
      const updated = { ...prev };
      (Object.keys(formData) as Array<keyof UserData>).forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });

    return !hasErrors;
  }, [formData, validateSingleField]);

  const handleSave = async () => {
    if (!formData) return;

    if (!validateForm()) {
      showError("Validation Error", "Please fix the errors before saving.");
      return;
    }

    try {
      dispatch(updateUser(formData));
      await dispatch(saveUserToStorage(formData));
      setIsEditing(false);
      Loggers.auth.info("Profile updated successfully");
    } catch (error) {
      Loggers.auth.error("Failed to update profile", error);
      showError("Error", "Failed to save profile changes. Please try again.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        dob: "",
        email: "",
      });
    }
    setFormErrors({});
    setTouchedFields({});
    setIsEditing(false);
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleLogoutPress = () => {
    setIsEditing(false);
    onLogout();
  };

  const handleBackdropPress = (event: any) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleBackdropPress}
        />
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderReject={(e) => e.stopPropagation()}
        >
          {/* Single Modal with conditional content */}
          {formData ? (
            <ProfileFormContent
              formData={formData}
              formErrors={formErrors}
              touchedFields={touchedFields}
              isEditing={isEditing}
              theme={theme}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onEditPress={handleEditPress}
              onCancel={handleCancel}
              onSave={handleSave}
              onLogout={handleLogoutPress}
              user={user}
            />
          ) : (
            <LoadingPlaceholder theme={theme} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: "85%",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  profileInfoContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  fieldsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
  },
  fieldWrapper: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  addressInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

