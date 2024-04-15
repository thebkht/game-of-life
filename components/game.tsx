"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { PauseIcon, PlayIcon, RotateCcw } from "lucide-react";

const cols = 30;
const rows = 30;

const createGrid = () => {
     const grid = [];
     for (let i = 0; i < rows; i++) {
          const row = [];
          for (let j = 0; j < cols; j++) {
               row.push(Math.floor(Math.random() * 2));
          }
          grid.push(row);
     }
     return grid;
};

const positions = [
     [0, 1],
     [0, -1],
     [1, -1],
     [-1, 1],
     [1, 1],
     [-1, -1],
     [1, 0],
     [-1, 0],
];

export default function Game() {
     const [grid, setGrid] = useState<number[][]>();
     const [start, setStart] = useState<boolean>(false);
     const startRef = useRef(start);
     startRef.current = start;

     useEffect(() => {
          setGrid(createGrid());
     }, []);

     function runSimulation() {
          if (!startRef.current) {
               return;
          }
          setGrid((g) => {
               const next = g?.map((row, i) => {
                    return row.map((cell, j) => {
                         let sum = 0
                         positions.forEach((position) => {
                              const x = i + position[0]
                              const y = j + position[1]
                              if (x >= 0 && x < rows && y >= 0 && y < cols) {
                                   sum += g[x][y]
                              }
                         })
                         if (sum < 2 || sum > 3) {
                              return 0
                         }
                         if (sum === 3) {
                              return 1
                         }
                         return g[i][j]
                    })
               })
               return next
          })
     }

     return (
          <>
               <div className="flex gap-2.5 justify-center items-center absolute top-4 left-4">
                    <Button
                         variant="ghost"
                         size={'icon'}
                         onClick={() => {
                              setStart(!start);
                              if (!start) {
                                   startRef.current = true;
                              }
                              setInterval(() => {
                                   runSimulation();
                              }, 1500);
                         }}
                    >
                         {start ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    </Button>
                    <Button
                         variant="ghost"
                         size={'icon'}
                         onClick={() => setGrid(createGrid)}
                    >
                         <RotateCcw className="w-4 h-4" />
                    </Button>
               </div>
               <div className="flex flex-wrap mt-10 flex-1">
                    {grid &&
                         grid.map((rows, i) =>
                              rows.map((col, k) => (
                                   <div
                                        key={`${i}-${k}`}
                                        className={`w-[30px] h-[30px] transition-all duration-150 rounded-[8px] border border-background ${grid[i][k] ? "bg-foreground opacity-100" : "opacity-0"
                                             }`}
                                   />
                              ))
                         )}
               </div>
          </>
     );
}
