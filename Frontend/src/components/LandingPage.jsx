import React from 'react';
import ParkingHeader from './ParkingHeader';
import ActionButton from './ActionButton';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = ({ onLoginClick, onSignupClick, onCreateTicketClick, onDispatchTicketClick }) => {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            <ParkingHeader onLoginClick={onLoginClick} onSignupClick={onSignupClick} />

            <main className="flex-grow flex flex-col items-center justify-center p-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Welcome to Smart Parking System
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Efficiently manage your parking experience with our digital ticket system
                    </p>

                    {currentUser && (
                        <p className="mt-4 text-green-600 font-medium">
                            You are logged in as {currentUser.name || currentUser.email}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                    <ActionButton
                        title="Create Ticket"
                        description="Generate a new parking ticket for your vehicle"
                        icon="ticket"
                        onClick={onCreateTicketClick}
                        bgColor="bg-blue-600"
                        hoverColor="hover:bg-blue-700"
                    />
                    <ActionButton
                        title="Dispatch Ticket"
                        description="Process payment and exit the parking area"
                        icon="car"
                        onClick={onDispatchTicketClick}
                        bgColor="bg-green-600"
                        hoverColor="hover:bg-green-700"
                    />
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-6 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p>© 2025 Smart Parking System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
