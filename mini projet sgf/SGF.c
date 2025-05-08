#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BLOCS 200

// Fonction pour calculer le nombre de pointeurs qu'un bloc peut contenir
int CalculNbPointeur(int TailleBloc, int TaillePointeur) {
    return TailleBloc / TaillePointeur;
}

// Fonction pour calculer la taille maximale d'un fichier en blocs de donnees
int CalculTailleMax(int NbPointeur) {
    int blocsDirects = 10;
    int blocsIndirectsSimples = NbPointeur;
    int blocsIndirectsDoubles = NbPointeur * NbPointeur;
    int blocsIndirectstriples = NbPointeur * NbPointeur * NbPointeur ;
    return blocsDirects + blocsIndirectsSimples + blocsIndirectsDoubles + blocsIndirectstriples;
}

// Fonction pour calculer la taille maximale reelle d'un fichier
int CalculMaxReelle(int NbPointeur, int NbBloc) {
    int tailleMaxDonnees = CalculTailleMax(NbPointeur);
    int blocsGestion = 23;
    if (tailleMaxDonnees + blocsGestion > NbBloc) {
        return NbBloc;
    }
    return tailleMaxDonnees + blocsGestion;
}

// Fonction pour verifier si le SGF est realisable
int VerifierSgfRealisable(int NbBloc, int MaxReelle) {
    if (MaxReelle > NbBloc) {
        printf("SGF non realisable : Pas assez de blocs disponibles.\n");
        return 0;
    } else {
        printf("SGF ralisable : Allocation possible.\n");
        return 1;
    }
}

// Initialisation du disque
void InitialiserDisque(char *Disque, int NbBloc) {
    for (int i = 0; i < NbBloc; i++) {
        Disque[i] = 'L';
    }
    printf("Disque initialise avec %d blocs libres.\n", NbBloc);
}

// Affichage de l'etat du disque
void AfficheDisque(char *Disque, int NbBloc) {
    printf("Etat actuel du disque :\n");
    for (int i = 0; i < NbBloc; i++) {
        printf("%c", Disque[i]);
        if ((i + 1) % 10 == 0) printf("\n");
    }
    printf("\n");
}

// Allocation d'un fichier selon la methode specifiee
void AllocationFichier(char *Disque, int NbBloc, char methode, int tailleFichier, int *T) {
    int i, compteur = 0, indexLibre;

    if (methode == 'C') { // Allocation chainee
        printf("Methode d'allocation : Chainee\n");
        for (i = 0; i < NbBloc && compteur < tailleFichier; i++) {
            if (Disque[i] == 'L') {
                Disque[i] = 'O';
                T[compteur] = i;
                compteur++;
            }
        }
    } else if (methode == 'G') { // Allocation contiguë
        printf("Methode d'allocation : Contiguë\n");
        for (i = 0; i <= NbBloc - tailleFichier; i++) {
            int libre = 1;
            for (int j = 0; j < tailleFichier; j++) {
                if (Disque[i + j] != 'L') {
                    libre = 0;
                    break;
                }
            }
            if (libre) {
                for (int j = 0; j < tailleFichier; j++) {
                    Disque[i + j] = 'O';
                }
                compteur = tailleFichier;
                break;
            }
        }
    } else if (methode == 'X') { // Allocation indexee
        printf("Methode d'allocation : Indexee\n");
        indexLibre = -1;
        for (i = 0; i < NbBloc; i++) {
            if (Disque[i] == 'L') {
                indexLibre = i;
                Disque[i] = 'O';
                break;
            }
        }
        if (indexLibre != -1) {
            compteur = 0;
            for (i = 0; i < NbBloc && compteur < tailleFichier; i++) {
                if (Disque[i] == 'L') {
                    Disque[i] = 'O';
                    compteur++;
                }
            }
        }
    }

    if (compteur < tailleFichier) {
        printf("Erreur : Espace insuffisant pour allouer %d blocs.\n", tailleFichier);
    } else {
        printf("Fichier de %d blocs alloue avec succes.\n", tailleFichier);
    }
}

// Recherche des blocs libres
void RechercheBlocLibre(int *T, int NbBloc) {
    printf("Blocs libres : ");
    for (int i = 0; i < NbBloc; i++) {
        if (T[i] == 0) {
            printf("%d ", i);
        }
    }
    printf("\n");
}

// Suppression d'un fichier
void DeleteFile(char *Disque, int NbBloc, int tailleFichier, int debut) {
    printf("Suppression d'un fichier de %d blocs à partir du bloc %d...\n", tailleFichier, debut);
    for (int i = debut; i < debut + tailleFichier && i < NbBloc; i++) {
        Disque[i] = 'L';
    }
}

// Mise à jour du vecteur d'allocation
void RemplirVecteur(char *Disque, int NbBloc, int *T) {
    for (int i = 0; i < NbBloc; i++) {
        T[i] = (Disque[i] == 'O') ? 1 : 0;
    }
}

// Fonction principale
void main() {
    char C, m;
    int NbBloc, TailleBloc, tailleFichier, Max, pointeur, NbPointeur, debut;
    char Disque[MAX_BLOCS];
    int T[MAX_BLOCS] = {0};

    do {
        printf("Que voulez-vous faire?\n");
        printf("Initialiser le Disque --> I\n"
               "Afficher l'espace disque disponible --> A\n"
               "Sauvegarder un fichier --> S\n"
               "Supprimer un fichier --> D\n"
               "Quitter le programme --> Q\n");
        scanf("%c", &C);
        getchar();

        switch (C) {
            case 'I':
                printf("Initialiser le disque:\n");
                printf("Saisir le nombre de blocs disque:\n");
                scanf("%d", &NbBloc);
                printf("Saisir la taille d un bloc disque:\n");
                scanf("%d", &TailleBloc);
                printf("Saisir la taille d un pointeur :\n");
                scanf("%d", &pointeur);
                getchar();

                NbPointeur = CalculNbPointeur(TailleBloc, pointeur);
                Max = CalculTailleMax(NbPointeur);
                int MaxReelle = CalculMaxReelle(NbPointeur, NbBloc);

                printf("Statistiques :\n");
                printf("Le disque comporte %d Blocs\n", NbBloc);
                printf("La taille d un bloc est %d Octets.\n", TailleBloc);
                printf("La taille d un pointeur est %d Octets\n", pointeur);
                printf("Le bloc de pointeurs comporte %d pointeurs\n", NbPointeur);
                printf("Taille maximale d un fichier est %d Blocs de donnees\n", Max);
                printf("Taille maximale reelle d un fichier est %d Blocs\n", MaxReelle);
                VerifierSgfRealisable(NbBloc, MaxReelle);

                InitialiserDisque(Disque, NbBloc);
                break;

            case 'S':
                printf("Allocation d'un fichier :\n");
                printf("Donner la taille du fichier :");
                scanf("%d", &tailleFichier);
                getchar();
                printf("Choisir une methode d'allocation : Chainee --> C ; Contigue --> G ; Indexee --> X :");
                scanf("%c", &m);
                getchar();
                AllocationFichier(Disque, NbBloc, m, tailleFichier, T);
                RemplirVecteur(Disque, NbBloc, T);
                AfficheDisque(Disque, NbBloc);
                break;

            case 'D':
                printf("Suppression Fichier:\n");
                printf("Donner la taille du fichier :");
                scanf("%d", &tailleFichier);
                printf("Donner le debut du fichier :");
                scanf("%d", &debut);
                getchar();
                DeleteFile(Disque, NbBloc, tailleFichier, debut);
                RemplirVecteur(Disque, NbBloc, T);
                AfficheDisque(Disque, NbBloc);
                break;

            case 'A':
                printf("Recherche de bloc disque libre:\n");
                RechercheBlocLibre(T, NbBloc);
                AfficheDisque(Disque, NbBloc);
                break;

            case 'Q':
                printf("Fin de programme\n");
                break;

            default:
                printf("Option non valide, reessayez.\n");
        }
    } while (C != 'Q');
}
