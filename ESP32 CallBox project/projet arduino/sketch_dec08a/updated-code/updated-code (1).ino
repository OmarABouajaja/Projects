#include <SoftwareSerial.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <MySQL_Encrypt_Sha1.h> 
#include <MySQL_Packet.h>
#include <ESP32_EmailClient.h>

SoftwareSerial sim800l(7, 8);  // Assuming SIM800L is connected to pins 7 (RX) and 8 (TX)

String idmach = "";  // id machine

int button1 = 9;
int button2 = 10;
int button3 = 11;
int button4 = 12;
bool button_State;

// MySQL database settings
IPAddress dbHost(YourCloudDBIPAddress);  // Replace with your cloud database IP address or hostname
const char* dbUser = "your_cloud_db_username";
const char* dbName = "your_cloud_db_name";
const char* dbPassword = "your_cloud_db_password";

const unsigned long interval = 28800;  // 8 hours in milliseconds
unsigned long previousMillis = 0;
MySQL_Connection dbConnection;

// Email settings
const char* emailServer = "your_email_server";
const char* emailUsername = "your_email_username";
const char* emailPassword = "your_email_password";
const char* senderEmail = "your_sender_email";
const char* recipientEmail = "your_recipient_email";
const char* emailSubject = "Arduino Log";
const char* emailBody = "";

struct Event {
  unsigned long timestamp;
  String details;
};

const int maxEvents = 50;  // Adjust the maximum number of events as needed
Event timeline[maxEvents];
int eventCount = 0;

const int maxLogSize = 10000;  // Adjust the maximum log size as needed
int currentLogSize = 0;

void connectGPRS() {
  sim800l.begin(9600);
  delay(1000);
  sim800l.println("AT");
  delay(1000);
  sim800l.println("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"");
  delay(1000);
  sim800l.println("AT+SAPBR=3,1,\"APN\",\"your_APN_here\"");
  delay(1000);
  sim800l.println("AT+SAPBR=1,1");
  delay(3000);
}

void connectMySQL() {
  Serial.println("Connecting to MySQL");
  dbConnection.connect(dbHost, dbUser, dbPassword, dbName);

  if (dbConnection.connected()) {
    Serial.println("Connected to MySQL");
  } else {
    Serial.println("Connection failed");
  }
}


void insertData(String pers, String machID) {
  Serial.println("Inserting data into MySQL");
  MySQL_Cursor* cursor = new MySQL_Cursor(&dbConnection);
  cursor->execute(("INSERT INTO " + pers + " (`id`, `temps`, `ID_machine`) VALUES (NULL, CURRENT_TIMESTAMP, " + machID + " );").c_str());
  delete cursor;

  // Log event to timeline
  logEvent(pers + " was called by " + machID);

  // Check log size
  currentLogSize += timeline[eventCount - 1].details.length();
  if (currentLogSize > maxLogSize) {
    restartDueToLogSize();
  }

  // Send email with logs
  emailBody = getTimelineAsString();
  sendEmail();
}

void logEvent(String details) {
  if (eventCount < maxEvents) {
    timeline[eventCount].timestamp = millis();
    timeline[eventCount].details = details;
    eventCount++;
  } else {
    Serial.println("Timeline full, cannot log more events");
  }
}

String getTimelineAsString() {
  String timelineStr = "Timeline:\n";
  for (int i = 0; i < eventCount; i++) {
    timelineStr += "[" + String(i + 1) + "] " + String(timeline[i].timestamp) + ": " + timeline[i].details + "\n";
  }
  return timelineStr;
}

void restartDueToLogSize() {
  Serial.println("Restarting Arduino due to log size...");
  sim800l.println("AT+CPOF");  // Power off SIM800L
  delay(1000);
  ESP.restart();
}

void setup() {
  pinMode(button1, INPUT_PULLUP);
  pinMode(button2, INPUT_PULLUP);
  pinMode(button3, INPUT_PULLUP);
  pinMode(button4, INPUT_PULLUP);
  Serial.begin(9600);
  delay(1000);

  connectGPRS();  // Connect to GPRS network
  connectMySQL();
}

void loop() {
  unsigned long currentMillis = millis();

  presbot(button1, "pivot", "+21626309588", idmach);
  presbot(button2, "qualité", "+21626309588", idmach);
  presbot(button3, "tecnicien", "+21626309588", idmach);
  presbot(button4, "logistique", "+21626309588", idmach);

  if (currentMillis - previousMillis >= interval) {
    resetArduino();
    previousMillis = currentMillis;
  }
}

void presbot(int bu, String person, String num, String machID) {
  button_State = digitalRead(bu);

  if (button_State == LOW) {
    Serial.println("Button pressed");
    delay(200);
    insertData(person, machID);
  }
}

void sendEmail() {
  EmailClient email;
  email.setup(emailServer, 587, emailUsername, emailPassword);
  email.setSender(senderEmail);
  email.setRecipient(recipientEmail);
  email.setSubject(emailSubject);
  email.setText(emailBody);

  Serial.println("Sending email...");
  if (email.send()) {
    Serial.println("Email sent successfully");s
  } else {
    Serial.println("Email sending failed");
  }
}

void resetArduino() {
  Serial.println("Performing software restart...");
  sim800l.println("AT+CPOF");  // Power off SIM800L
  delay(1000);
  ESP.restart();
}
