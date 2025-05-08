#include <SoftwareSerial.h>

SoftwareSerial sim800l(0, 1); 

int button1 = 7;
int button2 = 9;
int button3 = 10;
int button4 = 11;

bool button_State; 


void setup()
{
 
  pinMode(button1, INPUT_PULLUP); 
   pinMode(button2, INPUT_PULLUP);
    pinMode(button3, INPUT_PULLUP);
     pinMode(button4, INPUT_PULLUP);
  sim800l.begin(9600);   
  Serial.begin(9600);   
  delay(1000);
}
 
void loop()
{
presbot(button1 ,"pivot" , "+21626309588" );
presbot(button2,"supervisor" , "+21626309588" );
presbot(button3 ,"technicien" , "+21626309588" );
presbot(button4 ,"line chief" , "+21626309588" );
}


void presbot(int bu ,String person , String num ){

  button_State = digitalRead(bu);   
 
  if (button_State == LOW) {            
    Serial.println("Button pressed");   
    delay(200);                         
    
    SendSMS(person ,num);                         

}}
void SendSMS(String person , String num )
{
  Serial.println("Sending SMS to "+person+" ...");              
  sim800l.print("AT+CMGF=1\r");                   
  delay(100);
  sim800l.print("AT+CMGS=\""+num+"\"\r");  
  delay(500);
  sim800l.print("SIM800l is working");    
  delay(500);
  sim800l.print((char)26);
  delay(500);
  sim800l.println();
  Serial.println("Text Sent.");
  delay(500);

}
 
