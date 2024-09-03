import React, { useState, useEffect } from "react";

const CountdownTimer = ({
  initialTime,
  onEnd,
}: {
  initialTime: number;
  onEnd: () => any;
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado ou o tempo acabar
    return () => {
      clearInterval(timer);
    };
  }, [onEnd, timeLeft]);

  return <span>{timeLeft}s</span>;
};

export default CountdownTimer;
