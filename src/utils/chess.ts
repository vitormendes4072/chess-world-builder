import { BoardState, ChessPiece } from '@/types/chess';

export const createInitialBoard = (): BoardState => {
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'] as const;
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const isValidMove = (
  board: BoardState,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): boolean => {
  // Basic bounds checking
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
  
  const piece = board[fromRow][fromCol];
  if (!piece) return false;
  
  const targetPiece = board[toRow][toCol];
  
  // Can't capture own piece
  if (targetPiece && targetPiece.color === piece.color) return false;
  
  // Basic movement validation (simplified for now)
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward move
      if (fromCol === toCol && !targetPiece) {
        if (toRow === fromRow + direction) return true;
        if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
      }
      
      // Diagonal capture
      if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
        return true;
      }
      return false;
      
    case 'rook':
      return (rowDiff === 0 || colDiff === 0);
      
    case 'bishop':
      return rowDiff === colDiff;
      
    case 'queen':
      return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);
      
    case 'king':
      return rowDiff <= 1 && colDiff <= 1;
      
    case 'knight':
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      
    default:
      return false;
  }
};