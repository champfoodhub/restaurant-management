import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SeasonalMenu } from "../config/config";

interface SeasonalMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (menu: Omit<SeasonalMenu, "id" | "createdAt" | "updatedAt" | "items">) => void;
  seasonalMenus?: SeasonalMenu[];
  formatTimeRange?: (start: string, end: string) => string;
  theme: any;
  onDelete?: (id: string) => void;
  onAddItems?: (menu: SeasonalMenu) => void;
  onCreateNew?: () => void;
}

export function SeasonalMenuModal({
  visible,
  onClose,
  onCreate,
  theme,
}: SeasonalMenuModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("23:59");

  const handleCreate = () => {
    if (!name || !startDate || !endDate) return;
    onCreate({
      name,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      isActive: true,
    });
    // Reset form
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Create Seasonal Menu
          </Text>

          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Seasonal Menu Name"
            placeholderTextColor={theme.text + "80"}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Description"
            placeholderTextColor={theme.text + "80"}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Start Date (YYYY-MM-DD)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="2024-12-01"
            placeholderTextColor={theme.text + "80"}
            value={startDate}
            onChangeText={setStartDate}
          />
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            End Date (YYYY-MM-DD)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="2024-12-31"
            placeholderTextColor={theme.text + "80"}
            value={endDate}
            onChangeText={setEndDate}
          />
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Start Time (HH:mm)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="12:00"
            placeholderTextColor={theme.text + "80"}
            value={startTime}
            onChangeText={setStartTime}
          />
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            End Time (HH:mm)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="23:59"
            placeholderTextColor={theme.text + "80"}
            value={endTime}
            onChangeText={setEndTime}
          />

          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={[styles.modalButton, { backgroundColor: theme.muted }]}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.modalButtonText}>Create Menu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// List modal for viewing/managing seasonal menus
export function SeasonalMenuListModal({
  visible,
  onClose,
  seasonalMenus = [],
  formatTimeRange = () => "",
  theme,
  onDelete = () => {},
  onAddItems = () => {},
  onCreateNew = () => {},
}: SeasonalMenuModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Seasonal Menus
          </Text>

          {seasonalMenus.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.text + "80" }]}>
              No seasonal menus created yet
            </Text>
          ) : (
            seasonalMenus.map((menu) => (
              <View
                key={menu.id}
                style={[
                  styles.seasonalMenuItem,
                  { borderColor: theme.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.seasonalMenuName, { color: theme.text }]}>
                    {menu.name}
                  </Text>
                  <Text
                    style={[
                      styles.seasonalMenuDate,
                      { color: theme.text + "80" },
                    ]}
                  >
                    {menu.startDate} - {menu.endDate}
                  </Text>
                  <Text
                    style={[
                      styles.seasonalMenuTime,
                      { color: theme.text + "80" },
                    ]}
                  >
                    {formatTimeRange(menu.startTime, menu.endTime)}
                  </Text>
                </View>
                <View style={styles.seasonalMenuActions}>
                  <Switch
                    value={menu.isActive}
                    onValueChange={() => {}}
                    trackColor={{ false: "#767577", true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                  <Pressable
                    onPress={() => onAddItems(menu)}
                    style={[
                      styles.addItemButton,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <Text style={styles.addItemButtonText}>+ Items</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onDelete(menu.id)}
                    style={[styles.deleteButton, { backgroundColor: "#EF4444" }]}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <Pressable
            onPress={onCreateNew}
            style={[
              styles.addSeasonalButton,
              { backgroundColor: theme.primary },
            ]}
          >
            <Text style={styles.addSeasonalButtonText}>
              + Create New Seasonal Menu
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={[
              styles.modalButton,
              { backgroundColor: theme.muted, marginTop: 16 },
            ]}
          >
            <Text style={[styles.modalButtonText, { color: theme.text }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
  seasonalMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  seasonalMenuName: {
    fontSize: 16,
    fontWeight: "600",
  },
  seasonalMenuDate: {
    fontSize: 12,
    marginTop: 4,
  },
  seasonalMenuTime: {
    fontSize: 12,
    marginTop: 2,
  },
  seasonalMenuActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addSeasonalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  addSeasonalButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  addItemButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addItemButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
});

