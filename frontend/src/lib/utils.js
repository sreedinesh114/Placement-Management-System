import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const getDriveStudents = async (driveId, token) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/drives/${driveId}/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};