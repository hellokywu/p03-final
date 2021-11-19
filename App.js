import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons'; 
import { StyleSheet, Text, View, Button, TouchableOpacity, ImagePicker, Image, ScrollView, Linking } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location'; //import the whole module
import {Camera} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Device from 'expo-device';
const API_KEY = "k8FPAiQus8nwmUnExMbiZO7TKdWPpTvR"

function HomeScreen({navigation}) {
  const [location, setLocation] = useState(null);
  const [webcamObject, setWebcamObject] = useState(null);


  //Location services 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      //let result = await Location.getCurrentPositionAsync({});
      let result = await Location.geocodeAsync("150 S Woodlawn Ave, Bloomington, IN 47405")
      setLocation(result);
    })();
  }, []);

  useEffect(() => {
    getWebcams();
  }, 
  [location]);
  
  const getWebcams = async () => {
    const response = await fetch("https://api.windy.com/api/webcams/v2/list/nearby=39.1386689,-86.52760680139855,500/limit=1?show=webcams:image,player&key="+API_KEY); 
    // Tried to do this a few different ways; had a problem with second API call relying on the first one. Should look like below when using with any location ideally.
    // const response = await fetch("https://api.windy.com/api/webcams/v2/list/nearby=" + location?location[0].latitude:null + "," + location?location[0].longitude:null + ",500/limit=1?show=webcams:image,player&key=" + API_KEY); 
    const camInfo = await response.json();
     setWebcamObject(camInfo);
     console.log(camInfo);
     console.log(location);
     return camInfo;
   }

  console.log(location?location[0].latitude:null);
  // console.log(webcamObject.result.webcams[0].player.day.link);

  //i feel like this is probably a horrible way to render after useEffect...but need both parts of useEffect for location + API

  if (webcamObject === null) return null;
  
   // Only using webcams API, so weather dependent text function won't function. Relatively simple implementation detailed below
  // Read from weather API, then check for temperature ranges to display a message based on temp range
  // i.e. temp under 40F -> "it's really cold outside", temp between 40-60 -> "it's pretty cold", etc.
  // similar for rain; if chance> x%, "You might want to bring an umbrella", "watch for snow" if under 32F 
  return (
   <View>
     <Image
      style={styles.mainimage}
      source={{uri: webcamObject.result.webcams[0].image.current.preview}}/>
      <View style={styles.maintext}>
        <Button style={styles.streamButton} title="Check Video Feed" onPress={ ()=>{ Linking.openURL(webcamObject.result.webcams[0].player.day.link)}} />
        <Text>It’s pretty cold outside. You might want to bring an umbrella.</Text>
            <Text style={styles.locationTitle}>Nearest Webcam:</Text>
           <Text style={styles.locationTitle}>{webcamObject.result.webcams[0].title}</Text>
      </View>
        
        <MapView
          style={styles.map}
          region={{       
          latitude: location?location[0].latitude:null,
          longitude: location?location[0].longitude:null,
            latitudeDelta:0.1,
            longitudeDelta:0.1
          }}>      
      </MapView>
   </View>
  );
}

function SocialScreen() {
  const [image, setImage] = useState(null)
  const [cameraImage, setCameraImage] = useState(null)

  const openCamera = async()=>{
    
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if(status !== "granted"){
      alert("Media library permission is not granted")
      return
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync()

    if(cameraStatus.status !== "granted"){
      alert("Camera permission is not granted")
      return
    }

    const image = await ImagePicker.launchCameraAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.Images,
      allowsEditing:true,
      videoMaxDuration:2
    })
    setCameraImage(image.uri)

  }

  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    setCurrentDate(
      month + '/' + date + '/' + year + ' ' + hours + ':' + min
    );
  }, [cameraImage]);

  //wish we could save images to asyncstorage :(
  return (
<ScrollView contentContainerStyle={styles.container}>
  <View style={styles.socialbutton}>
  <Button
        title="Open Camera"
        style={styles.button}
        onPress={openCamera}
      />
      {cameraImage&&<Image source={{uri:cameraImage}} style={styles.image}/>}
  </View>
  <Image
      style={styles.socialimage}
      source={{uri: cameraImage}}/>
      <View style={styles.maintext}>
        <Image style={styles.playButton} size={48} source={{uri: 'https://hotemoji.com/images/emoji/i/g0i0931w5vc7i.png%27%7D%7D/%3E'}}/>
        <Text style={styles.photocreditText}>Submitted by {Device.deviceName}, {currentDate} </Text>
        </View>
    <Image
      style={styles.socialimage}
      source={{uri: 'https://images-webcams.windy.com/44/1626570444/current/preview/1626570444.jpg'}}/>
      <View style={styles.maintext}>
        <Image style={styles.playButton} size={48} source={{uri: 'https://hotemoji.com/images/emoji/i/g0i0931w5vc7i.png%27%7D%7D/%3E'}}/>
        <Text style={styles.photocreditText}>Submitted by Tom's iPhone X 11/17/2021 11:23 </Text>
        </View>
     <Image
      style={styles.socialimage}
      source={{uri: 'https://images-webcams.windy.com/37/1361986937/current/preview/1361986937.jpg'}}/>
      <View style={styles.maintext}>
        <Image style={styles.playButton} size={48} source={{uri: 'https://hotemoji.com/images/emoji/i/g0i0931w5vc7i.png%27%7D%7D/%3E'}}/>
        <Text style={styles.photocreditText}>Submitted by Mark's Galaxy S10 11/16/2021 2:30 </Text>
        </View>
        <Image
      style={styles.socialimage}
      source={{uri: 'https://images-webcams.windy.com/59/1583092359/current/preview/1583092359.jpg'}}/>
      <View style={styles.maintext}>
        <Image style={styles.playButton} size={48} source={{uri: 'https://hotemoji.com/images/emoji/i/g0i0931w5vc7i.png%27%7D%7D/%3E'}}/>
        <Text>Submitted by Dennis' iPhone 12 11/16/2021 11:30</Text>
        </View>
</ScrollView>
    
  );
}

function ModalScreen({navigation}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 30 }}>Probably easier to just link.</Text>
      <Button onPress={() => navigation.goBack()} title="Dismiss" />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {

  function streamModal() {
    return (
    <Stack.Navigator>
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
    <Stack.Screen name="Live Camera Feed" component={ModalScreen} />
  </Stack.Group>
    </Stack.Navigator>
    );
  }

  return (
    
    <NavigationContainer>
      <Tab.Navigator>
          <Tab.Group>
            <Tab.Screen name="Weather Outside" component={HomeScreen} options={{
                  title: "Look Outside",
                  tabBarIcon:({color})=>(<MaterialIcons name="beach-access" size={28} color="#25a848" />)
                }}/>
            <Tab.Screen name="Social Weather" component={SocialScreen} options={{
                  title: "Social Weather",
                  tabBarIcon:({color})=>(<MaterialIcons name="emoji-nature" size={28} color="#25a848" />)
                }}/>
          </Tab.Group>
        </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  map:{
    width: '100%',
    height: '30%',
  },

  mainimage:{
    width: '100%',
    height: 340,
  },

  streamButton:{
    fontWeight: 'bold',
    paddingBottom: 6,
  },
  
  locationTitle:{
    fontWeight: 'bold',
  },

  socialimage:{
    width: '90%',
    height: 200,
    paddingBottom: 12,
  },

  maintext:{
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialtext:{
    padding: 8,
  },

  socialbutton:{
    paddingTop: 16,
    paddingBottom: 16,
    width: '100%',
    backgroundColor: '#303030',
  },

  playButton:{
    paddingBottom: 12,
  },

  socialreactimage:{
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  camButton:{
    width:'100%',
    height:40,
    backgroundColor: 'red',
  },

  photocreditText:{
    fontStyle: 'italic',
    paddingBottom: 6,
    paddingTop: 6,
  },
});