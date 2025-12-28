/**
 * Action broadcaster - abstract transport for sending/receiving messages.
 */

import { NetworkMessage } from './types';

export abstract class ActionBroadcaster {
  abstract send(message: NetworkMessage): Promise<void>;
  abstract onMessage(callback: (msg: NetworkMessage) => void): void;
  abstract disconnect(): Promise<void>;
}

/**
 * Mock broadcaster for testing.
 */
export class MockBroadcaster extends ActionBroadcaster {
  private listeners: Array<(msg: NetworkMessage) => void> = [];
  private outgoing: NetworkMessage[] = [];

  async send(message: NetworkMessage): Promise<void> {
    this.outgoing.push(message);
    // Simulate broadcast to all listeners
    this.listeners.forEach((listener) => listener(message));
  }

  onMessage(callback: (msg: NetworkMessage) => void): void {
    this.listeners.push(callback);
  }

  async disconnect(): Promise<void> {
    this.listeners = [];
  }

  // Test helper
  getOutgoing(): NetworkMessage[] {
    return this.outgoing;
  }
}

/**
 * LAN broadcaster (UDP multicast).
 * Implementation is platform-specific; this is a stub.
 */
export class LanBroadcaster extends ActionBroadcaster {
  constructor(private port: number) {
    super();
  }

  async send(message: NetworkMessage): Promise<void> {
    // TODO: Implement UDP multicast
    // const json = JSON.stringify(message);
    // Send to 255.255.255.255:port
  }

  onMessage(callback: (msg: NetworkMessage) => void): void {
    // TODO: Listen on port
  }

  async disconnect(): Promise<void> {
    // TODO: Close socket
  }
}
