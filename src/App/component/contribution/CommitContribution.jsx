import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import DrawingPieBoard from "../DrawingPieBoard";
import Axios from "axios";
import moment from "moment";
import { connect } from "react-redux";

const commitContribution = function Contributions(prop) {
  const [commitListData, setCommitListData] = useState([]);
  const [chart, setChart] = useState([]);

  const [currentProject, setCurrentProject] = useState({});

  const projectId = localStorage.getItem("projectId");
  const jwtToken = localStorage.getItem("jwtToken");

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  useEffect(() => {
    Axios.get(`http://localhost:9100/pvs-api/project/1/${projectId}`, {
      headers: { Authorization: `${jwtToken}` },
    })
      .then((response) => {
        setCurrentProject(response.data);
      })
      .catch((e) => {
        alert(e.response.status);
        console.error(e);
      });
  }, []);
  
  useEffect(() => {
    if (Object.keys(currentProject).length != 0) {
      handleToggle();
      const githubRepo = currentProject.repositoryDTOList.find(
        (repo) => repo.type == "github"
      );
      const query = githubRepo.url.split("github.com/")[1];
      Axios.post(`http://localhost:9100/pvs-api/github/commits/${query}`, "", {
        headers: { Authorization: `${jwtToken}` },
      })
        .then((response) => {
          // todo need reafctor with async
          Axios.get(`http://localhost:9100/pvs-api/github/commits/${query}`, {
            headers: { Authorization: `${jwtToken}` },
          })
            .then((response) => {
              setCommitListData(response.data);
              handleClose();
            })
            .catch((e) => {
              alert(e.response.status);
              console.error(e);
            });
        })
        .catch((e) => {
          alert(e.response.status);
          console.error(e);
        });
    }
  }, [currentProject, prop.startDate, prop.endDate]);
  useEffect(() => {
    let { startDate, endDate } = prop;
    startDate = moment(startDate);
	
    const codeBases = commitListData.filter((commitListData) => {
      return moment(commitListData.committedDate).isBetween(
        startDate,
        endDate,
        "days",
        "[]"
      );
    });

	const countData = {};
	codeBases.forEach((v) =>{
		if (countData.hasOwnProperty(v.authorName)) {
			countData[v.authorName] +=1;
		} else {
			countData[v.authorName] = 1
		}
	});
	const tmpChart = [];
	for (const [key, value] of Object.entries(countData)) {
		let label = key.replace('"', '');
		tmpChart.push({label:label, data: value});
	}
	setChart(tmpChart);

  }, [commitListData, prop.startDate, prop.endDate]);


  return <div><div align="center"><h2>Commit</h2></div><DrawingPieBoard data={chart} /></div>
}

const mapStateToProps = (state) => {
  return {
    startDate: state.selectedDate.startDate,
    endDate: state.selectedDate.endDate,
  };
};

export default connect(mapStateToProps)(commitContribution)
