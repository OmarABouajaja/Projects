#include <Servo.h>

// Pins capteurs LDR
const int ldrEntree = A0;
const int ldrSortie = A1;

// Pins servomoteurs
const int servoEntreePin = 9;
const int servoSortiePin = 10;

// Déclaration des servos
Servo servoEntree;
Servo servoSortie;

// Pins afficheur 7 segments (a à g)
int afficha = 2;
int affichb = 3;
int affichc = 4;
int affichd = 5;
int affiche = 6;
int affichf = 7;
int affichg = 8;

// Paramètres
int totalPlaces = 8;       // Nombre total de places
int placesDisponibles = 8; // Initialement toutes libres

// Limite LDR
const int limite = 500; // Ajuster selon la lumière

void setup() {
  Serial.begin(9600);

  // Initialiser les servos
  servoEntree.attach(servoEntreePin);
  servoSortie.attach(servoSortiePin);
  fermerBarriere(servoEntree);
  fermerBarriere(servoSortie);

  // Initialiser les pins de l'afficheur
  pinMode(afficha, OUTPUT);
  pinMode(affichb, OUTPUT);
  pinMode(affichc, OUTPUT);
  pinMode(affichd, OUTPUT);
  pinMode(affiche, OUTPUT);
  pinMode(affichf, OUTPUT);
  pinMode(affichg, OUTPUT);

  // Afficher le nombre initial de places
  afficherChiffre(placesDisponibles);
}

void loop() {
  int valEntree = analogRead(ldrEntree);
  int valSortie = analogRead(ldrSortie);

  Serial.print("Entree: ");
  Serial.print(valEntree);
  Serial.print(" | Sortie: ");
  Serial.println(valSortie);

  // Détecter une voiture qui entre
  if (valEntree < limite && placesDisponibles > 0) {
    ouvrirBarriere(servoEntree);
    delay(2000); // Laisser le temps de passer
    fermerBarriere(servoEntree);

    placesDisponibles--;
    afficherChiffre(placesDisponibles);
    delay(1000); // Anti-rebond
  }

  // Détecter une voiture qui sort
  if (valSortie < limite && placesDisponibles < totalPlaces) {
    ouvrirBarriere(servoSortie);
    delay(2000); // Laisser le temps de passer
    fermerBarriere(servoSortie);

    placesDisponibles++;
    afficherChiffre(placesDisponibles);
    delay(1000); // Anti-rebond
  }

  delay(200); // Petite pause
}

// Fonction pour afficher un chiffre sur l'afficheur 7 segments
void afficherChiffre(int num) {
  switch (num) {
    case 0:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, HIGH);
      digitalWrite(affichf, HIGH);
      digitalWrite(affichg, LOW);
      break;
    case 1:
      digitalWrite(afficha, LOW);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, LOW);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, LOW);
      digitalWrite(affichg, LOW);
      break;
    case 2:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, LOW);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, HIGH);
      digitalWrite(affichf, LOW);
      digitalWrite(affichg, HIGH);
      break;
    case 3:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, LOW);
      digitalWrite(affichg, HIGH);
      break;
    case 4:
      digitalWrite(afficha, LOW);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, LOW);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, HIGH);
      digitalWrite(affichg, HIGH);
      break;
    case 5:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, LOW);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, HIGH);
      digitalWrite(affichg, HIGH);
      break;
    case 6:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, LOW);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, HIGH);
      digitalWrite(affichf, HIGH);
      digitalWrite(affichg, HIGH);
      break;
    case 7:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, LOW);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, LOW);
      digitalWrite(affichg, LOW);
      break;
    case 8:
      digitalWrite(afficha, HIGH);
      digitalWrite(affichb, HIGH);
      digitalWrite(affichc, HIGH);
      digitalWrite(affichd, HIGH);
      digitalWrite(affiche, HIGH);
      digitalWrite(affichf, HIGH);
      digitalWrite(affichg, HIGH);
      break;
    default:
      digitalWrite(afficha, LOW);
      digitalWrite(affichb, LOW);
      digitalWrite(affichc, LOW);
      digitalWrite(affichd, LOW);
      digitalWrite(affiche, LOW);
      digitalWrite(affichf, LOW);
      digitalWrite(affichg, LOW);
      break;
  }
}

// Ouvrir une barrière
void ouvrirBarriere(Servo servo) {
  servo.write(90); // Position ouverte
}

// Fermer une barrière
void fermerBarriere(Servo servo) {
  servo.write(0); // Position fermée
}
