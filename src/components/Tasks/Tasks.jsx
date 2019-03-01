import React, { Component } from "react";
import Checkbox from "../../components/CustomCheckbox/CustomCheckbox.jsx";

export class Tasks extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
        this.setState({ a: 1 });
  }

  handleCheckbox = event => {
    const target = event.target;
    console.log(event.target);
    this.setState({
      [target.name]: target.checked
    });
  };
  render() {
    const tasks_title = [...this.props.challengesList];
    let tasks = [];
    let number;
    for (let i = 0; i < tasks_title.length; i++) {
      number = "checkbox" + i;
      tasks.push(
        <tr key={i}>
          <td>
            <Checkbox
              number={number}
              isChecked={i === 0 && this.props.challengeCompleted ? true : false}
            />
          </td>
          <td>{tasks_title[i]}</td>
        </tr>
      );
    }
    return <tbody>{tasks}</tbody>;
  }
}

export default Tasks;
