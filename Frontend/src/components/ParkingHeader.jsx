import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ParkingHeader = ({ onLoginClick, onSignupClick }) => {
    const { currentUser, logout } = useAuth();

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <span className="text-2xl font-bold text-blue-600">ParkEase</span>
                </div>
                <nav>
                    {currentUser ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">
                                Welcome, {currentUser.name || currentUser.email}
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <ul className="flex space-x-4">
                            <li>
                                <button
                                    onClick={onLoginClick}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={onSignupClick}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </li>
                        </ul>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default ParkingHeader;