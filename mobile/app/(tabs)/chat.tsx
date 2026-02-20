import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am your PropSense AI assistant. Ask me anything about your property health or active sensors.', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMsg = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Abstracted fake AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I am actively monitoring your home! All vital environmental and plumbing sensors appear perfectly stable within normal operating levels.",
        sender: 'ai'
      }]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>PropSense AI</Text>
            <Text style={styles.headerSubtitle}>24/7 Virtual Assistant</Text>
        </View>
      </View>
      
      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <IconSymbol name="paperplane.fill" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#111827', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, zIndex: 10, elevation: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 15, color: '#9CA3AF', marginTop: 6, fontWeight: '500' },
  chatArea: { flex: 1 },
  chatContent: { padding: 20, gap: 16 },
  messageBubble: { maxWidth: '82%', padding: 16, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#3B82F6', borderBottomRightRadius: 6, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  messageText: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  userText: { color: '#fff' },
  aiText: { color: '#374151' },
  inputArea: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', gap: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  sendButton: { width: 50, height: 50, backgroundColor: '#3B82F6', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});
