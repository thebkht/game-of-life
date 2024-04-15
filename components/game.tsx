"use client";
import { useState, useEffect, useRef, useCallback } from "react";
// import deepcopy from 'deepcopy'

import { Button } from "./ui/button";
import { produce } from "immer";
import {
     PlayIcon,
     ResetIcon,
     ShuffleIcon,
     StopIcon,
     TrackNextIcon,
     TrackPreviousIcon,
} from "@radix-ui/react-icons";

// Experimental; Version 2
const doubleBuffer = {
     active: 0,
     states: [],
};
function updateBuffer(
     buffer: { active: number; states: { [x: string]: any } },
     newState: any
) {
     buffer.active = Number(!buffer.active);
     buffer.states[buffer.active] = newState;
     return buffer;
}

const defaultSize = 30;
const offsets = [
     { name: "nw", row: -1, col: -1 },
     { name: "n", row: -1, col: 0 },
     { name: "ne", row: -1, col: 1 },
     { name: "w", row: 0, col: -1 },
     { name: "e", row: 0, col: 1 },
     { name: "sw", row: 1, col: -1 },
     { name: "s", row: 1, col: 0 },
     { name: "se", row: 1, col: 1 },
];

// function getBuffer(buffer) {}
// function readLiveBuffer(buffer) {}
// function readPastBuffer(buffer) {}

function buildGrid(
     rows: number,
     cols: number,
     randomize = false,
     density = 0.2,
     val = 0
) {
     if (randomize) {
          const newGrid = [];
          for (let i = 0; i < rows; i++) {
               newGrid.push(
                    Array.from(Array(cols), () => (Math.random() > density ? 0 : 1))
               );
          }
          return newGrid;
     } else {
          return Array(rows).fill(Array(cols).fill(val));
     }
}

function getNewGeneration(grid: string | any[]) {
     // grid is a 2D array[i][j]
     const newGen = produce(grid, (copy: number[][]) => {
          for (let i = 0; i < grid.length; i++) {
               for (let j = 0; j < grid[i].length; j++) {
                    let neighborsCount = 0;
                    offsets.forEach((item) => {
                         const x = item.row + i;
                         const y = item.col + j;
                         if (x >= 0 && x < grid.length && y >= 0 && y < grid[i].length) {
                              neighborsCount += grid[x][y];
                         }
                    });

                    if (neighborsCount < 2 || neighborsCount > 3) {
                         copy[i][j] = 0;
                    } else if (neighborsCount === 3) {
                         copy[i][j] = 1;
                    }
               }
          }
     });
     // console.log(newGrid)
     return newGen;
}

export default function App() {
     const [duration, setDuration] = useState(500);
     const [numRows, setNumRows] = useState(defaultSize);
     const [numCols, setNumCols] = useState(defaultSize);
     const [isRunning, setIsRunning] = useState(false);
     const [grid, setGrid] = useState(buildGrid(defaultSize, defaultSize));
     const [generation, setGeneration] = useState(0);
     // const [buffer, setBuffer] = useState(doubleBuffer)
     const simStateRef = useRef(isRunning);
     simStateRef.current = isRunning; // fixes sync issue

     useEffect(() => {
          randomizeBoardHandler(isRunning);
     }, []);

     const simulate = () => {
          if (!simStateRef.current) {
               return;
          }
          // run simulation here recursively until stop condition
          // generate a new grid based on current
          // wait a while
          setGeneration(generation + 1);
          setGrid((curGrid) => {
               return getNewGeneration(curGrid) as number[][];
          });

          setTimeout(simulate, duration);
     };

     function startStopHandler(e: any) {
          // e.preventDefault()
          setIsRunning(!isRunning);
          if (!isRunning) {
               simStateRef.current = true;
               simulate();
          }
     }

     function cellToggleHandler(
          e: React.MouseEvent,
          i: number,
          j: number,
          isRunning: boolean
     ): void {
          // e.preventDefault()
          if (isRunning) {
               return;
          }
          setGrid(
               produce(grid, (copy: number[][]) => {
                    copy[i][j] = Number(!grid[i][j]);
               })
          );
     }
     function clearBoardHandler(isRunning: boolean) {
          // e.preventDefault()
          if (isRunning) {
               return;
          }
          setGeneration(0);
          setGrid(buildGrid(numRows, numCols));
     }
     function speedupSimulationHandler() {
          if (duration > 100) {
               setDuration(duration - 100);
          }
     }
     function slowdownSimulationHandler() {
          if (duration < 3000) {
               setDuration(duration + 100);
          }
     }
     function randomizeBoardHandler(isRunning: boolean) {
          if (isRunning) {
               return;
          }
          setGeneration(0);
          const newGrid = buildGrid(numRows, numCols, true);
          // console.log(newGrid)
          setGrid(newGrid);
     }

     return (
          <>
               <div className="flex gap-2.5 justify-center items-center absolute top-4 left-4">

                    <Button onClick={startStopHandler} variant="ghost" size={"icon"}>
                         {isRunning ? <StopIcon /> : <PlayIcon />}
                    </Button>
                    <Button
                         onClick={() => clearBoardHandler(isRunning)}
                         variant="ghost"
                         size={"icon"}
                    >
                         <ResetIcon />
                    </Button>
                    <Button
                         onClick={() => setDuration(duration - 100)}
                         variant="ghost"
                         size={"icon"}
                    >
                         <TrackPreviousIcon />
                    </Button>
                    <Button
                         onClick={() => setDuration(duration + 100)}
                         variant="ghost"
                         size={"icon"}
                    >
                         <TrackNextIcon />
                    </Button>
                    <Button
                         onClick={() => randomizeBoardHandler(isRunning)}
                         variant="ghost"
                         size={"icon"}
                    >
                         <ShuffleIcon />
                    </Button>
               </div>
               <div
                    className={"grid flex-1 mt-10"}
                    style={{
                         gridTemplateRows: `repeat(${numRows}, 26px)`,
                         gridTemplateColumns: `repeat(${numCols}, 26px)`,
                    }}
               >
                    {grid.map((row, i) =>
                         row.map((col: number, j: number) => (
                              <div
                                   onClick={(e) => cellToggleHandler(e, i, j, isRunning)}
                                   // className={`${styles.cell}${cell === 1 ? ' '+styles.cell_on : ''}`}
                                   key={`${i}${j}`}
                                   className={`w-6 h-6 transition-all duration-200 rounded-[4px] border ${col ? "bg-foreground opacity-100" : "opacity-0"
                                        }`}
                              />
                         ))
                    )}
               </div>
          </>
     );
}
