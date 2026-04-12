import { Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <View style={{flex: 1,justifyContent: "center",alignItems: "center", backgroundColor: "#2b2b30" }}>
      <Text style={{fontSize:50,color:"#BF6A02",fontWeight:"bold",  }}>AutoTrack</Text>
      <Text style={{fontSize:15,color:"#8b8b8b"}}>Kullanıcı adı ve şifrenizi giriniz</Text>
      <TextInput style={{backgroundColor:"black",borderRadius:10,width:340,borderColor:"#8b8b8b59",borderWidth:1,marginTop:20,padding:10,color:"white"}}
      placeholder="   Kullanıcı Adı"
      placeholderTextColor={"#cacaca"}/>
    </View>
  );
}
