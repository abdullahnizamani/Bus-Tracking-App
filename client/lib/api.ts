import { Bus, Student, Driver } from "@/types";
import { getApiUrl } from "@/lib/query-client";

async function authFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(endpoint, baseUrl).href;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
      ...options.headers,
    },
  });

  return response;
}
export async function getStudentBus(token: string): Promise<Bus | null> {
  try {
    const response = await authFetch("/api/student/bus/", token);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch bus");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching student bus:", error);
    throw error;
  }
}
export async function getDriverBus(token: string): Promise<Bus | null> {
  try {
    const response = await authFetch("/api/driver/bus/", token);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch bus");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching driver bus:", error);
    throw error;
  }
}


export async function getBusDetails(
  token: string,
  busId: number
): Promise<Bus | null> {
  try {
    const response = await authFetch(`/api/buses/${busId}/`, token);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch bus details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bus details:", error);
    throw error;
  }
}




export async function updateBusActiveStatus(
  token: string,
  busId: number,
  isActive: boolean
): Promise<void> {
  try {
    const response = await authFetch(`/api/buses/${busId}/`, token, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: isActive }), // <-- must match backend
    });

    if (!response.ok) {
      throw new Error("Failed to update bus status");
    }
  } catch (error) {
    console.error("Error updating bus status:", error);
    throw error;
  }
}



export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const response = await authFetch("/api/auth/change-password/", token, {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || "Failed to change password");
    }
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw error;
  }
}
