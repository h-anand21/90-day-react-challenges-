import styled from 'styled-components';

const TotalScore = ({ score }) => {
  return (
    <ScoreContainer>
      <h1>{score}</h1>
      <p>Total Score</p>
    </ScoreContainer>
  );
};

export default TotalScore;

const ScoreContainer = styled.div`
  text-align: center;

  h1 {
    font-size: 80px;
    line-height: 80px;
  }

  p {
    font-size: 20px;
    font-weight: 500;
  }
`;
