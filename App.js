import { StatusBar } from "expo-status-bar";
import moment from "moment";
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";

function Timer({ interval, styleTimer }) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  const duration = moment.duration(interval);
  const cSeconds = Math.floor(duration.milliseconds() / 10);
  return (
    <Text style={styleTimer}>
      {pad(duration.minutes())}:{pad(duration.seconds())}.{pad(cSeconds)}
    </Text>
  );
}

function ButtonRow({ children }) {
  return <View style={styles.buttonRow}>{children}</View>;
}

function RoundButton({ title, color, background, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress()}
      style={[styles.button, { backgroundColor: background }]}
      activeOpacity={disabled ? 1.0 : 0.65}
    >
      <View style={styles.buttonBorder}>
        <Text style={[styles.buttonTitle, { color }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

function Lap({ number, interval, fastest, slowest }) {
  let lapStyle = [
    styles.lapText,
    fastest && styles.fastest,
    slowest && styles.slowest,
  ];
  return (
    <View style={styles.lap}>
      <Text style={lapStyle}>Lap {number}</Text>
      <Timer styleTimer={lapStyle} interval={interval} />
    </View>
  );
}

function LapsTable({ laps, timer }) {
  const finishedLaps = laps.slice(1);
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  if (finishedLaps.length > 1) {
    finishedLaps.forEach((lap) => {
      if (lap < min) min = lap;
      if (lap > max) max = lap;
    });
  }
  return (
    <ScrollView style={styles.scrollview}>
      {laps.map((lap, index) => (
        <Lap
          number={laps.length - index}
          key={laps.length - index}
          interval={index == 0 ? timer + lap : lap}
          fastest={lap == max}
          slowest={lap == min}
        />
      ))}
    </ScrollView>
  );
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      now: 0,
      laps: [],
    };
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  start = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
      laps: [0],
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  lap = () => {
    const timestamp = new Date().getTime();
    const { laps, now, start } = this.state;
    const [firstlap, ...other] = laps;
    this.setState({
      laps: [0, firstlap + now - start, ...other],
      start: timestamp,
      now: timestamp,
    });
  };

  stop = () => {
    clearInterval(this.timer);
    const { laps, now, start } = this.state;
    const [firstlap, ...other] = laps;
    this.setState({
      laps: [firstlap + now - start, ...other],
      start: 0,
      now: 0,
    });
  };
  reset = () => {
    this.setState({
      laps: [],
      start: 0,
      now: 0,
    });
  };

  resume = () => {
    const now = new Date().getTime();
    this.setState({
      start: now,
      now,
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date().getTime() });
    }, 100);
  };

  render() {
    const { start, now, laps } = this.state;
    let timer = now - start;
    return (
      <View style={styles.container}>
        <Timer
          interval={laps.reduce((total, current) => total + current, 0) + timer}
          styleTimer={styles.timer}
        />
        <LapsTable laps={laps} timer={timer} />
        {laps.length == 0 && (
          <View style={styles.startButton}>
            <RoundButton
              onPress={this.start}
              title="Start"
              color="#FFFFFF"
              background="#3C76D6"
            />
          </View>
        )}

        {start > 0 && (
          <ButtonRow>
            <RoundButton
              title="Lap"
              onPress={this.lap}
              color="#FFFFFF"
              background="#838780"
            />
            <RoundButton
              onPress={this.stop}
              title="Stop"
              color="#FFFFFF"
              background="#C70039"
            />
          </ButtonRow>
        )}
        {laps.length > 0 && start == 0 && (
          <ButtonRow>
            <RoundButton
              title="Reset"
              onPress={this.reset}
              color="#FFFFFF"
              background="#838780"
            />
            <RoundButton
              onPress={this.resume}
              title="Resume"
              color="#FFFFFF"
              background="#3C76D6"
            />
          </ButtonRow>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 130,
    paddingHorizontal: 40,
  },
  timer: {
    color: "#000000",
    fontSize: 76,
    fontWeight: "200",
    marginBottom: 80,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ffffff",
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    marginTop: 80,
    marginBottom: 100,
  },
  lapText: {
    color: "#454845",
    fontWeight: "bold",
    fontSize: 16,
  },
  lap: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#000000",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  scrollview: {
    alignSelf: "stretch",
  },
  fastest: {
    color: "#4E7C55",
  },
  slowest: {
    color: "#D71818",
  },
  startButton: {
    marginBottom: 100,
  },
});
