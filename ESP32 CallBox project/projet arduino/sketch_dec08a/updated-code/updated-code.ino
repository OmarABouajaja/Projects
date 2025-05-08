#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include <WiFiUdp.h>
#include <SoftwareSerial.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <MySQL_Encrypt_Sha1.h>
#include <MySQL_Packet.h>

SoftwareSerial sim800l(0, 1); 


String idmach="";//id machine



int button1 = 7;
int button2 = 9;
int button3 = 10;
int button4 = 11;
bool button_State; 


const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";



const unsigned long interval = 28800; // 8 hours in milliseconds
unsigned long previousMillis = 0;
WiFiClient client;
MySQL_Connection dbConnection(&client);
void connectWiFi() {
  Serial.println("Connecting to WiFi");
  WiFi.begin(const_cast<char*>(ssid), const_cast<char*>(password));
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void connectMySQL() {
  Serial.println("Connecting to MySQL");
  MySQL_Connection dbConnection(&client);
  ////
  
  IPAddress dbHost(192, 168, 1, 2);
  const char *dbUser = "root";
  const char *dbName = "bdarduino";
  const char *dbPassword = "";
  int dbPort = 8080;

  /////
  dbConnection.connect(dbHost, dbPort, const_cast<char*>(dbUser), const_cast<char*>(dbPassword), const_cast<char*>(dbName));



  if (dbConnection.connected()) {
    Serial.println("Connected to MySQL");
  } else {
    Serial.println("Connection failed");
  }
}

void insertData(String pers ,String machID ) {
  //////

  
  String numchef="" ;//numero chef 
  
  
  /////
  Serial.println("Inserting data into MySQL");
  MySQL_Cursor *cursor = new MySQL_Cursor(&dbConnection);
  cursor->execute(("INSERT INTO " + pers + " (`id`, `temps`, `ID_machine`) VALUES (NULL, CURRENT_TIMESTAMP, " + machID + " );").c_str());
  delete cursor;           
  sim800l.print("AT+CMGF=1\r");                   
  delay(100);
  sim800l.print("AT+CMGS=\""+numchef+"\"\r");  
  delay(500);
  sim800l.print(pers+" was called by "+machID);    
  delay(500);
  sim800l.print((char)26);
  delay(500);
  sim800l.println();
  delay(500);
}



void setup()
{
 
  pinMode(button1, INPUT_PULLUP); 
  pinMode(button2, INPUT_PULLUP);
  pinMode(button3, INPUT_PULLUP);
  pinMode(button4, INPUT_PULLUP);
  sim800l.begin(9600);   
  Serial.begin(9600);   
  delay(1000);
  connectWiFi();
  connectMySQL();
}


void presbot(int bu ,String person , String num ,String machID){

  button_State = digitalRead(bu);   
 
  if (button_State == LOW) {            
    Serial.println("Button pressed");   
    delay(200);                         
    SendSMS(person ,num ,machID); 
    insertData(person,machID);                        

}}
void SendSMS(String person , String num  , String machID)
{
  Serial.println("Sending SMS to "+person+" ...");              
  sim800l.print("AT+CMGF=1\r");                   
  delay(100);
  sim800l.print("AT+CMGS=\""+num+"\"\r");  
  delay(500);
  sim800l.print("the machine ("+machID+") is OFF , intervention needed ");    
  delay(500);
  sim800l.print((char)26);
  delay(500);
  sim800l.println();
  Serial.println("Text Sent.");
  delay(500);

}

//void resetArduino() {
//    Serial.println("performing reset...");
//    delay(100); // Debounce
//    asm volatile("  jmp 0");
//}
//


 
void loop()
{
unsigned long currentMillis = millis();
////  


presbot(button1 ,"pivot" , "+21626309588" ,idmach);
presbot(button2,"qualité" , "+21626309588" ,idmach);
presbot(button3 ,"tecnicien" , "+21626309588" ,idmach);
presbot(button4 ,"logistique" , "+21626309588" ,idmach);


////
//if (currentMillis - previousMillis >= interval) {
//    resetArduino();
//    previousMillis = currentMillis;
//  }
//
}
