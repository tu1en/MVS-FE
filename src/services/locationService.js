// services/locationService.js

class LocationService {
    constructor() {
        this.watchId = null;
        this.lastPosition = null;
    }

    // Check if geolocation is supported
    isSupported() {
        return 'geolocation' in navigator;
    }

    // Check permission status
    async checkPermission() {
        if (!this.isSupported()) {
            return 'unsupported';
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            return result.state; // 'granted', 'denied', or 'prompt'
        } catch (error) {
            console.error('Permission check error:', error);
            return 'unknown';
        }
    }

    // Get current location with promise
    getCurrentLocation(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('Geolocation không được hỗ trợ trên trình duyệt này'));
                return;
            }

            const defaultOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            const finalOptions = { ...defaultOptions, ...options };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    
                    this.lastPosition = locationData;
                    resolve(locationData);
                },
                (error) => {
                    const errorMessages = {
                        [error.PERMISSION_DENIED]: 'Người dùng từ chối quyền truy cập vị trí',
                        [error.POSITION_UNAVAILABLE]: 'Không thể xác định vị trí hiện tại',
                        [error.TIMEOUT]: 'Quá thời gian chờ để lấy vị trí'
                    };
                    
                    reject(new Error(errorMessages[error.code] || 'Lỗi không xác định khi lấy vị trí'));
                },
                finalOptions
            );
        });
    }

    // Watch position changes
    watchPosition(callback, errorCallback, options = {}) {
        if (!this.isSupported()) {
            errorCallback(new Error('Geolocation không được hỗ trợ'));
            return null;
        }

        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const finalOptions = { ...defaultOptions, ...options };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                
                this.lastPosition = locationData;
                callback(locationData);
            },
            errorCallback,
            finalOptions
        );

        return this.watchId;
    }

    // Stop watching position
    clearWatch() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    // Calculate distance between two points (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    }

    toRad(value) {
        return value * Math.PI / 180;
    }

    // Check if location is within radius of target
    isWithinRadius(currentLat, currentLon, targetLat, targetLon, radiusMeters) {
        const distance = this.calculateDistance(currentLat, currentLon, targetLat, targetLon);
        return distance <= radiusMeters;
    }

    // Get public IP address
    async getPublicIP() {
        try {
            // Using multiple services for redundancy
            const services = [
                'https://api.ipify.org?format=json',
                'https://api64.ipify.org?format=json',
                'https://ipapi.co/json/'
            ];

            for (const service of services) {
                try {
                    const response = await fetch(service, { 
                        timeout: 5000,
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    
                    if (!response.ok) continue;
                    
                    const data = await response.json();
                    if (data.ip) return data.ip;
                    if (typeof data === 'string') return data;
                } catch (err) {
                    console.warn(`Failed to get IP from ${service}:`, err);
                    continue;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Get IP error:', error);
            return null;
        }
    }

    // Get address from coordinates (reverse geocoding)
    async getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'MVS-Attendance-System/1.0'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.display_name) {
                return data.display_name;
            }
            
            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }

    // Validate location accuracy
    isAccuracyAcceptable(accuracy, maxAccuracy = 100) {
        return accuracy <= maxAccuracy;
    }

    // Get last known position
    getLastPosition() {
        return this.lastPosition;
    }

    // Clear cached position
    clearLastPosition() {
        this.lastPosition = null;
    }

    // Check if device is in mock location mode (basic check)
    async checkForMockLocation() {
        try {
            // This is a basic check - more sophisticated checks would be done on backend
            const position = await this.getCurrentLocation({ maximumAge: 0 });
            
            // Check if accuracy is suspiciously perfect (common with mock locations)
            if (position.accuracy === 1 || position.accuracy === 0) {
                return { isMocked: true, reason: 'Perfect accuracy detected' };
            }

            // Check if coordinates are exactly the same as last known location
            if (this.lastPosition && 
                this.lastPosition.latitude === position.latitude &&
                this.lastPosition.longitude === position.longitude &&
                this.lastPosition.accuracy === position.accuracy) {
                return { isMocked: true, reason: 'Identical coordinates detected' };
            }

            return { isMocked: false };
        } catch (error) {
            return { isMocked: false, error: error.message };
        }
    }

    // Request high accuracy location with multiple attempts
    async getHighAccuracyLocation(maxAttempts = 3) {
        let bestLocation = null;
        let bestAccuracy = Infinity;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const location = await this.getCurrentLocation({
                    enableHighAccuracy: true,
                    timeout: 10000 + (attempt * 2000), // Increase timeout with each attempt
                    maximumAge: 0
                });

                if (location.accuracy < bestAccuracy) {
                    bestAccuracy = location.accuracy;
                    bestLocation = location;
                }

                // If we get good enough accuracy, return early
                if (location.accuracy <= 20) {
                    return location;
                }
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (bestLocation) {
            return bestLocation;
        }

        throw new Error('Could not obtain location after multiple attempts');
    }
}

export default new LocationService();