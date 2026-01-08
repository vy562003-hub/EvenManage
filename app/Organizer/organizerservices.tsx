import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { saveServicesAsync } from "@/store/slices/organizersSlice";

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const UserID = useAppSelector((state) => state.user.userId ?? state.organizers.userId)
  

  

  const [services, setServices] = useState<any[]>(
    useAppSelector((state) => state.organizers.selectedOrganizer?.services ??
      state.user.userdata?.services ??
      [] )
      
  );

  console.log(services,'services page');

  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // ADD SERVICE
  const addService = () => {
    if (!newName || !newPrice) {
      alert("Enter name and price");
      return;
    }

    const newService = {
      name: newName,
      price: Number(newPrice),
    };

    setServices((prev) => [...prev, newService]);
    setNewName("");
    setNewPrice("");
  };

  // DELETE SERVICE
  const deleteService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // SAVE TO BACKEND
  const saveServices = async () => {
    try {

      console.log(UserID,services,'UserID services page when service save');
      
      const res = await dispatch(
        saveServicesAsync({ userId:UserID, services })
      ).unwrap();
      
      console.log("servicessaved");
      

      if (!res.services) {
        alert("Failed to save services");
        return;
      }

      setServices(res.services);
      alert("Services updated successfully!");
      router.back();
    } catch (err) {
      console.log("Save service error:", err);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Manage Services</Text>

      {/* ADD NEW SERVICE */}
      <View style={styles.addBox}>
        <TextInput
          style={styles.input}
          placeholder="Service Name"
          value={newName}
          onChangeText={setNewName}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={newPrice}
          onChangeText={setNewPrice}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addService}>
          <Text style={styles.addBtnText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {/* LIST OF SERVICES */}
      <FlatList
        data={services}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.serviceRow}>
            <Text style={styles.serviceText}>
              {item.name} — ₹{item.price}
            </Text>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteService(index)}
            >
              <Text style={{ color: "#fff" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveServices}>
        <Text style={styles.saveText}>Save Services</Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addBox: {
    marginBottom: 20,
    backgroundColor: "#f3f3f3",
    padding: 16,
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: "#ff3b30",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  saveBtn: {
    marginTop: 15,
    backgroundColor: "green",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
