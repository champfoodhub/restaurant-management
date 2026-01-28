/**
 * Consolidated Styles for Restaurant Management App
 * 
 * This file contains all shared styles used across components.
 * Individual component files can import from here using relative paths.
 */

import { StyleSheet } from 'react-native';

// =============================================================================
// SHARED STYLES - Common reusable styles
// =============================================================================

export const sharedStyles = StyleSheet.create({
  // Modal overlay (common across all modals)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal content container
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },

  // Modal title
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  // Form input (common)
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },

  // Modal buttons container
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },

  // Primary modal button
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  // Modal button text
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // Circle button (controls)
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  // Circle button text (plus/minus)
  controlText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  // Quantity text
  qty: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },

  // Card container
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },

  // Primary action button
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // Add button text
  addText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Delete button
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  // Delete button text
  deleteText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  // Stock indicator
  stockIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  // Stock indicator text
  stockText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Controls row
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Item price
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Base price (strikethrough)
  basePrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading text
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },

  // Row layout
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  // Badge
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Badge text
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Error text
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Empty text
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default sharedStyles;
