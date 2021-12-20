import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import DrawingPieBoard from "../DrawingPieBoard";
import Axios from "axios";
import moment from "moment";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
    minWidth: "30px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

const openPullRequestContribution = function Contributions(prop) {
  const [pullRequestListData, setPullRequestListData] = useState([]);

  const [openChart, setOpenChart] = useState([]);
  const [mergeChart, setMergeChart] = useState([]);
  const [closeChart, setCloseChart] = useState([]);

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
      Axios.get(`http://localhost:9100/pvs-api/github/pull-requests/${query}`, {
        headers: { Authorization: `${jwtToken}` },
      })
        .then((response) => {
          setPullRequestListData(response.data);
          handleClose();
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
	
    const data = pullRequestListData.filter((pullRequestListData) => {
      return moment(pullRequestListData.createdAt).isBetween(
        startDate,
        endDate,
        "days",
        "[]"
      );
    });
	const closedPullRequests = data.filter(pullRequest => {
		return pullRequest.state == "closed";
	});

	const countData = {};
	closedPullRequests.forEach((v) =>{
		if (countData.hasOwnProperty(v.author)) {
			countData[v.author] = countData[v.author] + 1;
		} else {
			countData[v.author] = 1;
		}
	});
	const tmpOpenChart = [];
	for (const [key, value] of Object.entries(countData)) {
		tmpOpenChart.push({label:key, data:value});
	}
	setOpenChart(tmpOpenChart);

  }, [pullRequestListData, prop.startDate, prop.endDate]);

  return <div><div align="center"><h2>Closed Pull Request</h2></div><DrawingPieBoard data={openChart} /></div>
}

const mapStateToProps = (state) => {
  return {
    startDate: state.selectedDate.startDate,
    endDate: state.selectedDate.endDate,
  };
};

export default connect(mapStateToProps)(openPullRequestContribution)
