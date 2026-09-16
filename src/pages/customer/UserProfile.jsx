import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ProfileForm from "../../components/profile/ProfileForm";
import LoginMethodCard from "../../components/profile/LoginMethodCard";
import {
  getCachedUser,
  getCurrentUser,
  updateCurrentUser,
  uploadProfileImage,
} from "../../services/userService";
import { signOut } from "../../services/authServices";

const UserProfile = () => {
  const [user, setUser] = useState(() => getCachedUser());
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((data) => {
        if (mounted) {
          setUser(data);
        }
      })
      .catch(() => {
        if (mounted) {
          const cached = getCachedUser();
          if (cached.id) setUser(cached);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (values) => {
    const updated = await updateCurrentUser(values);
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handlePhotoChange = async (file) => {
    const updated = await uploadProfileImage(user.id, file);
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="lg:w-[210px] shrink-0">
          <ProfileSidebar onLogout={handleLogout} />
        </aside>

        <div className="flex-1 min-w-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your personal information and security settings.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <ProfileInfo user={user} onPhotoChange={handlePhotoChange} />
              <ProfileForm user={user} onSave={handleSave} />
            </div>
            <LoginMethodCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
