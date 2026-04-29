import styled from 'styled-components';

const NumberSelector = ({
  selectedNumber,
  setSelectedNumber,
  error,
  setError,
}) => {
  const arrNumber = [1, 2, 3, 4, 5, 6];

  const numberSelectorHandler = (value) => {
    setSelectedNumber(value);
    setError('');
  };

  return (
    <Container>
      <p className="error">{error}</p>

      <div className="flex">
        {arrNumber.map((value, i) => (
          <Box
            key={i}
            isSelected={value === selectedNumber}
            onClick={() => numberSelectorHandler(value)}
          >
            {value}
          </Box>
        ))}
      </div>

      <p>Select Number</p>
    </Container>
  );
};

export default NumberSelector;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;

  .flex {
    display: flex;
    gap: 10px;
  }

  .error {
    color: red;
  }

  p {
    font-size: 18px;
    font-weight: bold;
  }
`;

const Box = styled.div`
  height: 50px;
  width: 50px;
  border: 1px solid black;
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;

  background-color: ${(props) => (props.isSelected ? 'black' : 'white')};
  color: ${(props) => (!props.isSelected ? 'black' : 'white')};
`;
