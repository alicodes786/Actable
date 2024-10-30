import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


interface NotificationDropdownProps {
  notifications: { message: string }[]; 
  onClose: () => void; // Callback function to close the dropdown
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onClose }) => {
  return (
    <View style={styles.dropdown}>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <React.Fragment key={index}>
            <Text style={styles.dropdownItem}>{notification.message}</Text>
            {index < notifications.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))
      ) : (
        <Text style={styles.noNotifications}>No notifications</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    dropdown: {
        position: 'absolute',
        top: 60, 
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 5,
        width: 250, 
        zIndex: 1000, 
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
  },
  noNotifications: {
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
  },
  divider: {
    height: 1,
    backgroundColor: 'lightgray',
    marginHorizontal: 10,
  },
});

export default NotificationDropdown;
