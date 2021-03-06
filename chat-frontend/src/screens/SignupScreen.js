import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Modal 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Context as AuthContext } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import Colors from '../constants/colors';

const SignupScreen = (props) => {
  const { state: { errorMessageSignup }, signup, clearErrorMessage, setStatusBarColor } = useContext(AuthContext);

  return (
    <Modal visible={props.visible} animationType="slide">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View style={styles.closeModalContainer}>
            <TouchableOpacity onPress={() => {
              clearErrorMessage();
              props.closeModal();
            }}>
              <MaterialIcons name="close" size={35} color={Colors.tertiary} />
            </TouchableOpacity>
          </View>
          <AuthForm 
            header="Join the chat"
            submitBtn="Sign Up"
            navLinkFirst="Already have an account?"
            navLinkSecond="Sign in here"
            routeName="Signin"
            onSubmit={signup}
            toggleModal={props.toggleModal}
            />
          {errorMessageSignup ? 
            Alert.alert('Signup unsuccessful!', errorMessageSignup, [{ text: 'Try again', onPress: () => clearErrorMessage }]) :
            null
          }
          {Platform.OS === 'ios' && <KeyboardAvoidingView behavior="padding" />}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeModalContainer: {
    position: 'absolute',
    top: 30,
    right: 15
  }
});

export default SignupScreen;