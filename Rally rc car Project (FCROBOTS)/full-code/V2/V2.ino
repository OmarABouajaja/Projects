char t;
int s1 = 1 ;
int s2 = 1 ;
// move wheels to forward direction
int flf= 13;//front left forward
int frf= 12;//front right forward
int rlf= 11;//rear left forward
int rrf= 10;//rear right forward
// move wheels to reverse direction
int flr= 9;//front left reverse
int frr= 8;//front right reverse
int rlr= 7;//rear left reverse
int rrr= 6;//rear right reverse
int ledfl= 5; //front left wheel  indicator
int ledfr= 4;  //front right    wheel indicator
int ledrl= 3;  //rear left  wheel indicator 
int ledrr= 2; //rear right   wheel indicator

//--------------------------------//
void switchwd(int x ){
//fwd
  if (x>0) {
  
   flf= 13;//front left forward
   frf= 12;//front right forward
   rlf= ledrl;//rear left forward
   rrf= ledrr;//rear right forward
  // move wheels to reverse direction
   flr= 9;//front left reverse
   frr= 7;//front right reverse
   rlr= ledrl;//rear left reverse
   rrr= ledrr;//rear right reverse
  }
//Rwd
  else if (x<0) {
  
   flf= ledfl;//front left forward
   frf= ledfr;//front right forward
   rlf= 11;//rear left forward
   rrf= 10;//rear right forward
  // move wheels to reverse direction
   flr= ledfl;//front left reverse
   frr= ledfr;//front right reverse
   rlr= 7;//rear left reverse
   rrr= 6;//rear right reverse
  }
//4wd : default
  else {
  
   flf= 13;//front left forward
   frf= 12;//front right forward
   rlf= 11;//rear left forward
   rrf= 10;//rear right forward
  // move wheels to reverse direction
   flr= 9;//front left reverse
   frr= 8;//front right reverse
   rlr= 7;//rear left reverse
   rrr= 6;//rear right reverse
  }
}
void switchpos(int x ){
//Normal position
  if (x>0) {
// move wheels to forward direction
flf= 13;//front left forward
frf= 12;//front right forward
rlf= 11;//rear left forward
rrf= 10;//rear right forward
// move wheels to reverse direction
flr= 9;//front left reverse
frr= 8;//front right reverse
rlr= 7;//rear left reverse
rrr= 6;//rear right reverse
  }
//Inverted position
  else if (x<0) {
// move wheels to forward direction
flf= 6;//front left forward
frf= 7;//front right forward
rlf= 8;//rear left forward
rrf= 9;//rear right forward
// move wheels to reverse direction
flr= 10;//front left reverse
frr= 11;//front right reverse
rlr= 12;//rear left reverse
rrr= 13;//rear right reverse
  }

}
void setup() {
  pinMode(flf,OUTPUT);   //front left forward
  pinMode(rlf,OUTPUT);   //rear left forward
  pinMode(frf,OUTPUT);   //front right forward
  pinMode(rrf,OUTPUT);   //rear right forward
  // -------------------- //
  pinMode(flr,OUTPUT);   //front left reverse
  pinMode(rlr,OUTPUT);   //rear left reverse
  pinMode(frr,OUTPUT);   //front right reverse
  pinMode(rrr,OUTPUT);   //rear right reverse
  // ------------------- //
  pinMode(ledfl,OUTPUT);   //front left wheel indicator
  pinMode(ledfr,OUTPUT);   //front right wheel indicator
  pinMode(ledrl,OUTPUT);   //rear left wheel indicator
  pinMode(ledrr,OUTPUT);   //rear right wheel indicator
  Serial.begin(9600);
  digitalWrite(ledfl,HIGH);
  digitalWrite(ledfr,HIGH);
  digitalWrite(ledrl,HIGH);
  digitalWrite(ledrr,HIGH);
  delay(1000);
  digitalWrite(ledfl,LOW);
  digitalWrite(ledfr,LOW);
  digitalWrite(ledrl,LOW);
  digitalWrite(ledrr,LOW);
  Serial.println("Attempting to connect...");
  Serial.print("AT+NAMEGLADIATOR");
  Serial.print("AT+PIN2804");
  digitalWrite(flf,HIGH);
  digitalWrite(frf,HIGH);
  digitalWrite(rlf,HIGH);
  digitalWrite(rrf,HIGH);
  delay(500);
  digitalWrite(flf,LOW);
  digitalWrite(frf,LOW);
  digitalWrite(rlf,LOW);
  digitalWrite(rrf,LOW);
  Serial.println("Ready ");
}

void loop() {
if(Serial.available()){
  t = Serial.read();
  Serial.println(t);
}
 
if(t == 'F'){            //move  forward(all motors rotate in forward direction)
  //---//forward:
  digitalWrite(flf,HIGH);
  digitalWrite(frf,HIGH);
  digitalWrite(rlf,HIGH);
  digitalWrite(rrf,HIGH);
  //---//reverse:
  digitalWrite(flr,LOW);
  digitalWrite(frr,LOW);
  digitalWrite(rlr,LOW);
  digitalWrite(rrr,LOW);
}
 
else if(t == 'B'){      //move reverse (all  motors rotate in reverse direction)
  //---//forward:
  digitalWrite(flf,LOW);
  digitalWrite(frf,LOW);
  digitalWrite(rlf,LOW);
  digitalWrite(rrf,LOW);
  //---//reverse:
  digitalWrite(flr,HIGH);
  digitalWrite(frr,HIGH);
  digitalWrite(rlr,HIGH);
  digitalWrite(rrr,HIGH);
}
  
else if(t == 'C'){      //turn RIGHT  (diagonals wheels turn same direction to turn 360° )
  //---//forward:
  digitalWrite(flf,HIGH);
  digitalWrite(frf,LOW);
  digitalWrite(rlf,HIGH);
  digitalWrite(rrf,LOW);
  //---//reverse:
  digitalWrite(flr,LOW);
  digitalWrite(frr,HIGH);
  digitalWrite(rlr,LOW);
  digitalWrite(rrr,HIGH);
}
 
else  if(t == 'O'){      //turn LEFT (diagonals wheels turn same direction to turn 360° )
  //---//forward:
  digitalWrite(flf,LOW);
  digitalWrite(frf,HIGH);
  digitalWrite(rlf,LOW);
  digitalWrite(rrf,HIGH);
  //---//reverse:
  digitalWrite(flr,HIGH);
  digitalWrite(frr,LOW);
  digitalWrite(rlr,HIGH);
  digitalWrite(rrr,LOW);
}
else if(t == 'R'){      //turn RIGHT-FORWARD (all wheels turn forward except the front Right one)
  //---//forward:
  digitalWrite(flf,HIGH);
  digitalWrite(frf,LOW);
  digitalWrite(rlf,HIGH);
  digitalWrite(rrf,HIGH);
  //---//reverse:
  digitalWrite(flr,LOW);
  digitalWrite(frr,LOW);
  digitalWrite(rlr,LOW);
  digitalWrite(rrr,LOW);
}
else  if(t == 'L'){      //turn LEFT-FORWARD (all wheels turn forward except the front Left one)
  //---//forward:
  digitalWrite(flf,LOW);
  digitalWrite(frf,HIGH);
  digitalWrite(rlf,HIGH);
  digitalWrite(rrf,HIGH);
  //---//reverse:
  digitalWrite(flr,LOW);
  digitalWrite(frr,LOW);
  digitalWrite(rlr,LOW);
  digitalWrite(rrr,LOW);
}
//// fwd-rwd switch
else if (t=='X'){
  switchwd(s1);

  s1*=-1 ;}
//
//// restore default 4wd
else if (t=='P'){
  switchwd(0);
}
else if (t=='Y'){
  switchpos(s2);
  s2*=-1 ;
  }

//STOP (all motors stop when no command recieved && all leds blink)
else if (t=='T'){
  //---//forward:
  digitalWrite(flf,LOW);
  digitalWrite(frf,LOW);
  digitalWrite(rlf,LOW);
  digitalWrite(rrf,LOW);
  //---//reverse:
  digitalWrite(flr,LOW);
  digitalWrite(frr,LOW);
  digitalWrite(rlr,LOW);
  digitalWrite(rrr,LOW);}
}
