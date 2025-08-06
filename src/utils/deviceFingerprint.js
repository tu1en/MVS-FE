// utils/deviceFingerprint.js
class DeviceFingerprint {
    // Generate unique device fingerprint
    async generate() {
        const fingerprint = {
            // Screen properties
            screen: this.getScreenFingerprint(),
            
            // Browser properties
            browser: this.getBrowserFingerprint(),
            
            // Hardware properties
            hardware: this.getHardwareFingerprint(),
            
            // Canvas fingerprint
            canvas: await this.getCanvasFingerprint(),
            
            // WebGL fingerprint
            webgl: this.getWebGLFingerprint(),
            
            // Timezone and language
            locale: this.getLocaleFingerprint(),
            
            // Plugins (if available)
            plugins: this.getPluginsFingerprint()
        };

        // Generate hash from all properties
        const fingerprintString = JSON.stringify(fingerprint);
        const hash = await this.generateHash(fingerprintString);

        return {
            fingerprint: hash,
            details: fingerprint,
            timestamp: new Date().toISOString()
        };
    }

    // Screen fingerprint
    getScreenFingerprint() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }

    // Browser fingerprint
    getBrowserFingerprint() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(',') : navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack,
            onLine: navigator.onLine,
            vendor: navigator.vendor,
            vendorSub: navigator.vendorSub || '',
            product: navigator.product,
            productSub: navigator.productSub || '',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }

    // Hardware fingerprint
    getHardwareFingerprint() {
        return {
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            cpuClass: navigator.cpuClass || 'unknown'
        };
    }

    // Canvas fingerprint
    async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = 200;
            canvas.height = 50;
            
            // Draw text with various styles
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Device Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Canvas fp', 4, 17);
            
            // Get canvas data
            const dataURL = canvas.toDataURL();
            return this.simpleHash(dataURL);
        } catch (error) {
            return 'canvas-not-available';
        }
    }

    // WebGL fingerprint
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return 'webgl-not-supported';
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            
            return {
                vendor: gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR),
                renderer: gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER)
            };
        } catch (error) {
            return 'webgl-error';
        }
    }

    // Locale fingerprint
    getLocaleFingerprint() {
        return {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(',') : navigator.language
        };
    }

    // Plugins fingerprint
    getPluginsFingerprint() {
        if (!navigator.plugins || navigator.plugins.length === 0) {
            return 'no-plugins';
        }

        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            plugins.push({
                name: navigator.plugins[i].name,
                description: navigator.plugins[i].description,
                filename: navigator.plugins[i].filename
            });
        }

        return plugins;
    }

    // Generate SHA-256 hash
    async generateHash(str) {
        if (window.crypto && window.crypto.subtle) {
            try {
                const msgBuffer = new TextEncoder().encode(str);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.warn('Crypto.subtle failed, using fallback hash:', error);
                return this.simpleHash(str);
            }
        } else {
            // Fallback to simple hash
            return this.simpleHash(str);
        }
    }

    // Simple hash function (fallback)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    // Store fingerprint in localStorage
    store(fingerprint) {
        try {
            localStorage.setItem('device_fingerprint', JSON.stringify({
                id: fingerprint,
                created: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Cannot store fingerprint:', error);
        }
    }

    // Retrieve stored fingerprint
    retrieve() {
        try {
            const stored = localStorage.getItem('device_fingerprint');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Cannot retrieve fingerprint:', error);
            return null;
        }
    }

    // Validate fingerprint hasn't changed significantly
    async validate() {
        const stored = this.retrieve();
        if (!stored) return false;

        const current = await this.generate();
        return stored.id === current.fingerprint;
    }

    // Get or generate fingerprint (with caching)
    async getOrGenerate() {
        const stored = this.retrieve();
        
        // If stored fingerprint is less than 24 hours old, use it
        if (stored && stored.created) {
            const age = Date.now() - new Date(stored.created).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            if (age < maxAge) {
                return {
                    fingerprint: stored.id,
                    fromCache: true,
                    age: age
                };
            }
        }
        
        // Generate new fingerprint
        const newFingerprint = await this.generate();
        this.store(newFingerprint.fingerprint);
        
        return {
            fingerprint: newFingerprint.fingerprint,
            fromCache: false,
            details: newFingerprint.details
        };
    }

    // Clear stored fingerprint
    clear() {
        try {
            localStorage.removeItem('device_fingerprint');
        } catch (error) {
            console.error('Cannot clear fingerprint:', error);
        }
    }
}

export default new DeviceFingerprint();