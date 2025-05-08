char t;
int s1 = 1 ;
int s2 = 1 ;

int fwdf = 5 ;
int fwdr = 6 ;
int rwdf = 7 ;
int rwdr = 8 ;
int right = 9 ;
int left = 10 ;
//--------------------------------//
void switchwd(int x ){
//fwd
  if (x>0) {
  
    fwdf = 5 ;
    fwdr = 6 ;
    rwdf = 13 ;
    rwdr = 13;
    right = 9 ;
    left = 10 ;
  }
//Rwd
  else if (x<0) {
  
    fwdf = 13 ;
    fwdr = 13;
    rwdf = 7 ;
    rwdr = 8 ;
    right = 9 ;
    left = 10 ;
  }
//4wd : default
  else {
  
    fwdf = 5 ;
    fwdr = 6 ;
    rwdf = 7 ;
    rwdr = 8 ;
    right = 9 ;
    left = 10 ;
  }
}

void setup() {
  pinMode(fwdf,OUTPUT);  
  pinMode(fwdr,OUTPUT);   
  pinMode(rwdf,OUTPUT);   
  pinMode(rwdr,OUTPUT);   
  pinMode(right,OUTPUT);   
  pinMode(left,OUTPUT);  
  // -------------------- //

  Serial.begin(9600);
  Serial.println("Attempting to connect...");
  Serial.print("AT+NAMEGLADIATOR");
  Serial.print("AT+PIN2804");


  digitalWrite(right,HIGH);
  delay(1000);
  digitalWrite(right,LOW);
  delay(500);
  digitalWrite(left,HIGH);
  delay(1000);
  digitalWrite(left ,LOW);
  
  Serial.println("Ready ");
}

void loop() {
if(Serial.available()){
  t = Serial.read();
  Serial.println(t);
}
 
if(t == 'F'){            //move  forward(all motors rotate in forward direction)
  //---//forward:
  digitalWrite(fwdf,HIGH);
  digitalWrite(rwdf,HIGH);
  digitalWrite(fwdr,LOW);
  digitalWrite(rwdr,LOW);
}
 
else if(t == 'B'){      //move reverse (all  motors rotate in reverse direction)
  digitalWrite(fwdf,LOW);
  digitalWrite(rwdf,LOW);
  digitalWrite(fwdr,HIGH);
  digitalWrite(rwdr,HIGH);

}
  
else if(t == 'C'){      //turn RIGHT  (diagonals wheels turn same direction to turn 360° )
  digitalWrite(fwdf,LOW);
  digitalWrite(rwdf,LOW);
  digitalWrite(fwdr,HIGH);
  digitalWrite(rwdr,HIGH);
  digitalWrite(right,HIGH);
  digitalWrite(left,LOW);
}
 
else  if(t == 'O'){      //turn LEFT (diagonals wheels turn same direction to turn 360° )
  digitalWrite(fwdf,LOW);
  digitalWrite(rwdf,LOW);
  digitalWrite(fwdr,HIGH);
  digitalWrite(rwdr,HIGH);
  digitalWrite(right,LOW);
  digitalWrite(left,HIGH);
}
else if(t == 'R'){      //turn RIGHT-FORWARD (all wheels turn forward except the front Right one)
  //---//forward:
  digitalWrite(fwdf,HIGH);
  digitalWrite(rwdf,HIGH);
  digitalWrite(fwdr,LOW);
  digitalWrite(rwdr,LOW);
  digitalWrite(right,HIGH);
  digitalWrite(left,LOW);
}
else  if(t == 'L'){      //turn LEFT-FORWARD (all wheels turn forward except the front Left one)
  digitalWrite(fwdf,HIGH);
  digitalWrite(rwdf,HIGH);
  digitalWrite(fwdr,LOW);
  digitalWrite(rwdr,LOW);
  digitalWrite(right,LOW);
  digitalWrite(left,HIGH);
}
//// fwd-rwd switch
else if (t=='X'){

  digitalWrite(fwdf,HIGH);
  digitalWrite(fwdr,HIGH);
}

else if (t=='Y'){
  digitalWrite(fwdf,HIGH);
  digitalWrite(rwdf,LOW);
  digitalWrite(fwdr,HIGH);
  digitalWrite(rwdr,LOW);
  }

//STOP (all motors stop when no command recieved && all leds blink)
else if (t=='T'){
  digitalWrite(fwdf,LOW);
  digitalWrite(rwdf, LOW);
  digitalWrite(fwdr,LOW);
  digitalWrite(rwdr,LOW);
  digitalWrite(right,LOW);
  digitalWrite(left,LOW);}
}
