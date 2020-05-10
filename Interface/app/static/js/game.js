
/**
 * Permet de traiter la commande
 * envoyée par le joueur.
 *
 * @example Commandes possibles:
 * "vert-A1"
 * "Bleu-E3"
 * "BLEU-d7"
 * "MUR-B3-v"
 * "mur-F4-H"
 * @param {string} text
 */
function processCommand(text){
    params = text.split("-");
    let command = params[0].toUpperCase();
    let [x,y] = convertCoords(params[1].toUpperCase());
    switch (command){
        case "VERT":
            movePiece("green", x, y);
            break;
        case "BLEU":
            movePiece("blue", x, y);
            break;
        case "MUR":
            let direction = params[2].toLowerCase(); // h ou v
            placeWall(direction, x, y);
    }
}

let gameGrid = document.getElementById("gamegrid");
let gridSize = 9;
let pieces = {
    blue: {x: 0, y: 0},
    green: {x: 0, y: 0},
    red: {x: 0, y: 0},
    yellow: {x: 0, y: 0},
};

//Position dans le table ASCII
const ACode = 65;
const ZCode = 90;

/**
 * Permet de générer la grille initiale,
 * avec une taille par défaut de 9
 * @param {number} size
 */
function generateGrid(size = 9) {
    gridSize = size;
    gameGrid.innerHTML = ""; //supprime la grille précédente
    for (let i = 0; i < size; i++) {
        let cellRow = document.createElement("div");
        cellRow.classList = "row cell-row";
        gameGrid.appendChild(cellRow);

        let rowLabel = document.createElement("span");
        rowLabel.classList = "row-label";
        rowLabel.textContent = size - i; // 9 -> 1
        cellRow.appendChild(rowLabel);

        let wallRow = document.createElement("div");
        wallRow.classList = "row wall-row";
        gameGrid.appendChild(wallRow);
        for (let j = 0; j < size; j++) {
            let cell = document.createElement("span");
            cell.classList = "cell";
            cell.setAttribute("x-row", i);
            cell.setAttribute("x-col", j);

            cellRow.appendChild(cell);

            if (i + 1 < size){
                let hWall = document.createElement("span");
                hWall.classList = "wall h-wall inactive";
                hWall.setAttribute("x-row", i);
                hWall.setAttribute("x-col", j);

                wallRow.appendChild(hWall);
            }

            if (j + 1 < size) {
                let vWall = document.createElement("span");
                vWall.classList = "wall v-wall inactive";
                vWall.setAttribute("x-row", i);
                vWall.setAttribute("x-col", j);

                cellRow.appendChild(vWall);

                if (i + 1 < size){
                    let xWall = document.createElement("span");
                    xWall.classList = "wall x-wall inactive";
                    xWall.setAttribute("x-row", i);
                    xWall.setAttribute("x-col", j);

                    wallRow.appendChild(xWall);
                }
            }

        }
    }

    let labelCols = document.createElement("div");
    labelCols.classList = "row label-row";
    gameGrid.appendChild(labelCols);
    for (let i = 0; i < size; i++) {
        let label = document.createElement("span");
        label.classList = "col-label";
        label.textContent = String.fromCharCode(ACode + i);
        labelCols.appendChild(label);

        let spacing = document.createElement("span");
        spacing.classList = "spacing-label";
        labelCols.appendChild(spacing);
    }


    //Pose des pions
    let colors = ["blue", "green", "red", "yellow"];
    let positions = [
        {x: Math.ceil((size - 1)/2), y: 0},
        {x: size - 1, y: Math.ceil((size - 1)/2)},
        {x: Math.ceil((size - 1)/2), y: size - 1},
        {x: 0, y: Math.ceil((size - 1)/2)},
    ]
    for (let index = 0; index < 4; index++) {
        let piecePos = positions[index];
        let tmpPiece = document.createElement("div");
        tmpPiece.classList = "piece";
        tmpPiece.id = colors[index];
        let cell = selectCell(piecePos.x, piecePos.y);
        cell.appendChild(tmpPiece);
        pieces[colors[index]] = piecePos;
    }
};

generateGrid(); //initialise la page avec une grille

/**
 * Donne une chaîne de type `A1` et la convertit
 * en un tableau contenant les coordonnées
 * horizontale et verticale demandées.
 * Le tableau contient **toujours** 2 éléments.
 * Note: le résultat peut varier selon la taille de la grille
 * @example Avec une grille de taille 9:
 * "D2" -> [3, 7]
 * "E6" -> [4, 3]
 * @param {string} rawCoords
 * @returns {number[]} Les coordonnées sous forme de 2 nombres
 */
function convertCoords(rawCoords) {
    let val = rawCoords.charCodeAt(0);
    if (val < ACode || val > ZCode){ //si le caractère n'est pas une lettre
        throw new Error("Coordonnées invalides");
    }
    return [val - ACode, gridSize - rawCoords[1]];
}

/**
 * Permet de sélectionner une cellule
 * à partir des coordonnées x et y
 * en partant d'en haut à gauche
 * @param {number} x
 * @param {number} y
 */
function selectCell(x, y) {
    return document.querySelector(".cell[x-row='"+y+"'][x-col='"+x+"']");
}

/**
 * Permet de sélectionner les murs horizontaux
 * à partir des coordonnées x et y
 * en partant d'en haut à gauche
 * @param {number} x
 * @param {number} y
 */
function selectHWalls(x, y){
    return [
        document.querySelector(".h-wall[x-row='"+y+"'][x-col='"+x+"']"),
        document.querySelector(".x-wall[x-row='"+y+"'][x-col='"+x+"']"),
        document.querySelector(".h-wall[x-row='"+y+"'][x-col='"+(x+1)+"']")
    ]
}

/**
 * Permet de sélectionner les murs verticaux
 * à partir des coordonnées x et y
 * en partant d'en haut à gauche
 * @param {number} x
 * @param {number} y
 */
function selectVWalls(x, y){
    return [
        document.querySelector(".v-wall[x-row='"+y+"'][x-col='"+x+"']"),
        document.querySelector(".x-wall[x-row='"+y+"'][x-col='"+x+"']"),
        document.querySelector(".v-wall[x-row='"+(y+1)+"'][x-col='"+x+"']")
    ]
}

/**
 * Permet de placer des murs aux coordonnées souhaitées
 * et dans la direction indiquée
 * (Remplace la classe `.inactive` par `.active`)
 *
 * @param {"v" | "h"} direction
 * @param {number} x
 * @param {number} y
 */
function placeWall(direction, x, y){
    if (direction === "v"){
        selectVWalls(x, y).forEach(element => element.classList.replace("inactive", "active"));
    }
    if (direction === "h"){
        selectHWalls(x, y).forEach(element => element.classList.replace("inactive", "active"));
    }
}

/**
 * Permet de déplacer une des 4 pièces, en indiquant la couleur
 * et les nouvelles coordonnées
 * L'ancienne position est automatiquement ajustée
 * @param {"blue" | "green" | "red" | "yellow"} color
 * @param {number} x
 * @param {number} y
 */
function movePiece(color, x, y){
    let oldPiecePos = pieces[color];
    let oldCell = selectCell(oldPiecePos.x, oldPiecePos.y);
    oldCell.innerHTML = "";
    let tmpPiece = document.createElement("div");
    tmpPiece.classList = "piece";
    tmpPiece.id = color;
    let newCell = selectCell(x, y);
    newCell.appendChild(tmpPiece);
    pieces[color] = {x: x, y: y};
}