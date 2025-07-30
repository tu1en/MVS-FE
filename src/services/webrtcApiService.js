import apiClient from './apiClient';

/**
 * WebRTC API Service
 * Handles WebRTC configuration and peer connection management
 */
class WebRTCApiService {
  
  /**
   * Get WebRTC configuration from server
   */
  async getWebRTCConfig() {
    try {
      const response = await apiClient.get('/webrtc/config');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get WebRTC config:', error);
      // Fallback to default configuration
      return {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      };
    }
  }

  /**
   * Get LiveStream configuration
   */
  async getLiveStreamConfig() {
    try {
      const response = await apiClient.get('/webrtc/livestream-config');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get LiveStream config:', error);
      return {
        maxViewers: 100,
        recordingEnabled: false,
        chatEnabled: true
      };
    }
  }

  /**
   * Create peer connection for user
   */
  async createPeerConnection(userId, config = {}) {
    try {
      const response = await apiClient.post(`/webrtc/peer-connection/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create peer connection:', error);
      throw error;
    }
  }

  /**
   * Get peer connection info
   */
  async getPeerConnectionInfo(userId) {
    try {
      const response = await apiClient.get(`/webrtc/peer-connection/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get peer connection info:', error);
      return null;
    }
  }

  /**
   * Send offer to server
   */
  async sendOffer(userId, offer) {
    try {
      const response = await apiClient.post(`/webrtc/offer/${userId}`, offer);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to send offer:', error);
      throw error;
    }
  }

  /**
   * Send answer to server
   */
  async sendAnswer(userId, answer) {
    try {
      await apiClient.post(`/webrtc/answer/${userId}`, answer);
    } catch (error) {
      console.error('❌ Failed to send answer:', error);
      throw error;
    }
  }

  /**
   * Send ICE candidate to server
   */
  async sendIceCandidate(userId, candidate) {
    try {
      await apiClient.post(`/webrtc/ice-candidate/${userId}`, candidate);
    } catch (error) {
      console.error('❌ Failed to send ICE candidate:', error);
      throw error;
    }
  }

  /**
   * Get WebRTC statistics
   */
  async getWebRTCStats() {
    try {
      const response = await apiClient.get('/webrtc/stats');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get WebRTC stats:', error);
      return {
        activeConnections: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Test WebRTC connectivity
   */
  async testConnectivity() {
    try {
      const config = await this.getWebRTCConfig();
      const testUserId = 'test-' + Date.now();
      
      // Create a test peer connection
      await this.createPeerConnection(testUserId);
      
      console.log('✅ WebRTC connectivity test passed');
      return { success: true, config };
    } catch (error) {
      console.error('❌ WebRTC connectivity test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new WebRTCApiService();
