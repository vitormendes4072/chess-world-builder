import { useState, useCallback } from 'react';
import { BoardState, Position } from '@/types/chess';
import { createInitialBoard, isValidMove } from '@/utils/chess';
import { ChessSquare } from './ChessSquare';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ChessBoard = () => {
  const [board, setBoard] = useState<BoardState>(createInitialBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);

  const startGame = useCallback(() => {
    setBoard(createInitialBoard());
    setSelectedSquare(null);
    setCurrentPlayer('white');
    setPossibleMoves([]);
    setGameActive(true);
  }, []);

  const resignGame = useCallback(() => {
    setGameActive(false);
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, []);

  const calculatePossibleMoves = useCallback((row: number, col: number): Position[] => {
    const moves: Position[] = [];
    
    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        if (isValidMove(board, row, col, toRow, toCol)) {
          moves.push({ row: toRow, col: toCol });
        }
      }
    }
    
    return moves;
  }, [board]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!gameActive) return; // Don't allow moves when game is not active
    
    const piece = board[row][col];
    
    if (selectedSquare) {
      // If clicking on the same square, deselect
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
      
      // Try to make a move
      if (isValidMove(board, selectedSquare.row, selectedSquare.col, row, col)) {
        const newBoard = board.map(row => [...row]);
        const movingPiece = newBoard[selectedSquare.row][selectedSquare.col];
        
        if (movingPiece && movingPiece.color === currentPlayer) {
          newBoard[row][col] = movingPiece;
          newBoard[selectedSquare.row][selectedSquare.col] = null;
          
          setBoard(newBoard);
          setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        }
      }
      
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (piece && piece.color === currentPlayer) {
      // Select a piece
      setSelectedSquare({ row, col });
      setPossibleMoves(calculatePossibleMoves(row, col));
    }
  }, [board, selectedSquare, currentPlayer, calculatePossibleMoves, gameActive]);

  const isSquareHighlighted = useCallback((row: number, col: number): boolean => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  }, [possibleMoves]);

  const isSquareSelected = useCallback((row: number, col: number): boolean => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  }, [selectedSquare]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        {!gameActive ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Xadrez dos Amigos
            </h2>
            <p className="text-muted-foreground">
              Clique em "Iniciar Partida" para começar a jogar
            </p>
            <Button 
              onClick={startGame}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Iniciar Partida
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Turno: {currentPlayer === 'white' ? 'Brancas' : 'Pretas'}
            </h2>
            <Button 
              onClick={resignGame}
              variant="destructive"
              size="sm"
            >
              Desistir da Partida
            </Button>
          </div>
        )}
      </div>
      
      <div 
        className={cn(
          "grid grid-cols-8 gap-0 border-4 border-accent rounded-lg overflow-hidden",
          "shadow-[var(--shadow-board)]",
          !gameActive && "opacity-70"
        )}
        style={{ 
          background: "var(--gradient-board)",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 === 0;
            
            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                isLight={isLight}
                isSelected={isSquareSelected(rowIndex, colIndex)}
                isHighlighted={isSquareHighlighted(rowIndex, colIndex)}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
      
      {gameActive && (
        <div className="text-center text-sm text-muted-foreground max-w-md">
          <p>Clique em uma peça para selecioná-la, depois clique no destino para mover.</p>
        </div>
      )}
    </div>
  );
};