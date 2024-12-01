import React, { useState, useEffect } from "react";
import { getUser, logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  const navigate = useNavigate();

  // Dummy classes (replace this with real data from the backend later)
  const dummyClasses = [
    { id: 1, name: "Mathematics 101", teacher: "You", schedule: "Monday, 10:00 AM" },
    { id: 2, name: "Introduction to Physics", teacher: "You", schedule: "Wednesday, 2:00 PM" },
    { id: 3, name: "History of Art", teacher: "You", schedule: "Friday, 1:00 PM" },
  ];

  // Check if token is expired
  const isTokenExpiredFn = (token) => {
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (e) {
      return true;
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const checkTokenAndFetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken && isTokenExpiredFn(accessToken)) {
        setShowSessionExpiredModal(true);
        return;
      }

      try {
        const response = await getUser();
        setUser(response.data);
        setLoading(false);
        setClasses(dummyClasses);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          setShowSessionExpiredModal(true);
        } else {
          setError("Failed to load user data");
        }
        setLoading(false);
      }
    };

    checkTokenAndFetchUser();
  }, []);

  // Handle session expired
  const handleSessionExpired = () => {
    setShowSessionExpiredModal(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Directly remove access and refresh tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle Join Class (for now it's a dummy function)
  const handleJoinClass = (classId) => {
    alert(`Joined class with ID: ${classId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Your Classes</h2>
        <ul className="space-y-4 flex-grow">
          {classes.map((classItem) => (
            <li key={classItem.id} className="bg-indigo-600 p-4 rounded-md shadow-md hover:bg-indigo-500 cursor-pointer">
              <h3 className="font-semibold">{classItem.name}</h3>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Session Expired Modal */}
        {showSessionExpiredModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Session Expired</h2>
              <p className="text-gray-600 mb-6">
                Your session has expired. Please login again to continue.
              </p>
              <button
                onClick={handleSessionExpired}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              >
                Login Again
              </button>
            </div>
          </div>
        )}

        {/* Token Expiration Notification */}
        {isTokenExpired && !showSessionExpiredModal && (
          <div className="bg-yellow-500 text-white p-4 rounded-md mb-4">
            <p>Your session has expired. Please log in again.</p>
          </div>
        )}

        {/* Button to Join Class */}
        <div className="mt-6 text-end">
          <button
            onClick={() => handleJoinClass(1)}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Create Class
          </button>
        </div>

        <h1 className="text-3xl font-bold text-indigo-700">Teacher Dashboard</h1>

        {/* User Information */}
        {loading ? (
          <p className="text-center text-gray-600 mt-4">Loading your data...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-4">{error}</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-700">
              Welcome, {user?.username}!
            </h2>
          </div>
        )}

        {/* Classes Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700">Your Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {classes.map((classItem) => (
              <div key={classItem.id} className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-700">{classItem.name}</h3>
                <p className="text-gray-500">Teacher: {classItem.teacher}</p>
                <p className="text-gray-500">Schedule: {classItem.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
