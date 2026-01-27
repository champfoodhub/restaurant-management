import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
    card: string;
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
}

const ProfileField = ({
  label,
  value,
  onChangeText,
  editable,
  theme,
  keyboardType = "default",
  placeholder,
}: FieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: theme.accent }]}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        {
          color: theme.text,
          backgroundColor: editable ? theme.card : theme.muted + "30",
          borderColor: theme.border,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.text + "60"}
    />
  </View>
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
  const [formData, setFormData] = useState<UserData | null>(user);

  React.useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSave = async () => {
    if (formData) {
      dispatch(updateUser(formData));
      await dispatch(saveUserToStorage(formData));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(user);
    }
    setIsEditing(false);
  };

  const handleLogoutPress = () => {
    setIsEditing(false);
    onLogout();
  };

  if (!formData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Profile
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
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

            {/* Profile Info Summary - All 6 fields */}
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
                isEditing ? handleCancel() : setIsEditing(true)
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
          >
            <View style={styles.fieldsContainer}>
              <View style={styles.row}>
                <View style={[styles.fieldWrapper, { marginRight: 8 }]}>
                  <ProfileField
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    editable={isEditing}
                    theme={theme}
                    placeholder="Enter first name"
                  />
                </View>
                <View style={[styles.fieldWrapper, { marginLeft: 8 }]}>
                  <ProfileField
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    editable={isEditing}
                    theme={theme}
                    placeholder="Enter last name"
                  />
                </View>
              </View>

              <ProfileField
                label="Email"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                editable={isEditing}
                theme={theme}
                keyboardType="email-address"
                placeholder="Enter email"
              />

              <ProfileField
                label="Phone"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                editable={isEditing}
                theme={theme}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />

              <ProfileField
                label="Date of Birth"
                value={formData.dob}
                onChangeText={(text) =>
                  setFormData({ ...formData, dob: text })
                }
                editable={isEditing}
                theme={theme}
                placeholder="DD/MM/YYYY"
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
                        ? theme.card
                        : theme.muted + "30",
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  editable={isEditing}
                  multiline
                  textAlignVertical="top"
                  placeholder="Enter address"
                  placeholderTextColor={theme.text + "60"}
                />
              </View>
            </View>

            {/* Spacing for logout button */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleCancel}
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
                onPress={handleSave}
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
                onPress={handleLogoutPress}
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

