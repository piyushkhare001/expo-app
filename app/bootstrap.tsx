// app/bootstrap.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { loadProfiles } from "@/store/profileSlice";

export default function Bootstrap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadProfiles());
  }, [dispatch]);

  // Return null instead of loading indicator
  return null;
}