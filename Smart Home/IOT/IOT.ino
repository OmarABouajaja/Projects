#include "Ubidots.h"
#include "DHT.h"
#define DHTTYPE DHT11
#define DHTPIN 2  
DHT dht(DHTPIN, DHTTYPE);
const char* UBIDOTS_TOKEN = "BBFF-6un8gPbDlezkjx2uQVx2gFu9Y7Q9FK";                                     // Put  Ubidots TOKEN
const char* WIFI_SSID = "Yassine";                                         // Put  Wi-Fi SSID
const char* WIFI_PASS = "Yassine1";                                         // Put  Wi-Fi password
const char* DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM = "esp32";  // Replace  device label
const char* Lampe = "Lampe";       // Replace with your variable label
const char* niveau  d'eau = "niveau  d'eau";
const char* température = "température";
const char* the door state = "the door state";
const char* window state = "window state";
const char* gaz = "gaz";
const char* humidité = "humidité";
const char* humidité de sol = "humidité de sol";
Ubidots ubidots(UBIDOTS_TOKEN, UBI_HTTP);
void setup() {
  Serial.begin(115200);
  ubidots.wifiConnect(WIFI_SSID, WIFI_PASS);
  dht.begin();
  // ubidots.setDebug(true); //Uncomment this line for printing debug messages
}

void loop() {
  /* Obtain last value from a variable as float using HTTP */
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float Lampe = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, Lampe);
  float niveau  d'eau  = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, niveau  d'eau );
  float température = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, température);
  float the door state = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, the door state);
  float window state = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, window state);
  float gaz = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, gaz);
  float humidité = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, humidité);
  float humidité de sol = ubidots.get(DEVICE_LABEL_TO_RETRIEVE_VALUES_FROM, humidité de sol);

  // Evaluates the results obtained
  if (value != ERROR_VALUE) {
    Serial.print("Value:");
    Serial.println(value);
  }
  delay(5000);
}
void t&h(){
  ubidots.add("température", value1);  

  bool bufferSent = false;
  bufferSent = ubidots.send(); 

  if (bufferSent) {
    // Do something if values were sent properly
    Serial.println("Values sent by the device");
  }
  }
