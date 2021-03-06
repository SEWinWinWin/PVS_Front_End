import React, { useEffect, useState } from "react";
import logo_p from "./../../p.png";
import logo_v from "./../../v.png";
import logo_s from "./../../s.png";
import { useHistory, useLocation } from "react-router-dom";
import {
  ExitToApp,
  ArrowBack,
  ExpandLess,
  ExpandMore,
  Code,
  GpsFixed,
} from "@material-ui/icons";
import {
  Drawer,
  List,
  ListItem,
  MenuItem,
  ListItemText,
  ListItemIcon,
  CssBaseline,
  AppBar,
  Toolbar,
  Divider,
  Collapse,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import { AiFillBug } from "react-icons/ai";
import { IoGitCommitSharp, IoNuclear } from "react-icons/io5";
import { GoIssueOpened } from "react-icons/go";
import { GoGitPullRequest } from "react-icons/go";
import { BsFillPieChartFill } from "react-icons/bs";
import { HiDocumentDuplicate } from "react-icons/hi";
import { SiGithub, SiSonarqube } from "react-icons/si";
import { RiDashboardFill } from "react-icons/ri";
import clsx from "clsx";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import {
  setStartMonth,
  setEndMonth,
  setStartDate,
  setEndDate,
} from "./../../redux/action";
import Axios from "axios";

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  // search: {
  //   position: 'relative',
  //   borderRadius: theme.shape.borderRadius,
  //   backgroundColor: fade(theme.palette.common.white, 0.15),
  //   '&:hover': {
  //     backgroundColor: fade(theme.palette.common.white, 0.25),
  //   },
  //   marginRight: theme.spacing(2),
  //   marginLeft: 0,
  //   width: '100%',
  //   [theme.breakpoints.up('sm')]: {
  //     marginLeft: theme.spacing(3),
  //     width: 'auto',
  //   },
  // },
  // searchIcon: {
  //   padding: theme.spacing(0, 2),
  //   height: '100%',
  //   position: 'absolute',
  //   pointerEvents: 'none',
  //   display: 'flex',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // inputRoot: {
  //   color: 'inherit',
  // },
  // inputInput: {
  //   padding: theme.spacing(1, 1, 1, 0),
  //   paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
  //   transition: theme.transitions.create('width'),
  //   width: '100%',
  //   [theme.breakpoints.up('md')]: {
  //     width: '20ch',
  //   },
  // },
  list: {
    width: 200,
    height: "calc(100%)",
    width: "auto",
  },

  logout: {
    position: "absolute",
    right: 0,
  },
  menuList: {
    height: "calc(100%)",
  },
  monthSelector: {
    width: 204,
    padding: theme.spacing(0, 3, 0),
  },
  innerList: {
    backgroundColor: "#fafafa",
  },
}));

function Sidebar(prop) {
  //todo seperate sidebar and appbar~~~

  const [open, setOpen] = useState(true);
  const history = useHistory();
  const classes = useStyles();
  const [currentProject, setCurrentProject] = useState(undefined);
  const [githubMenuOpen, setGithubMenuOpen] = useState(true);
  const [sonarMenuOpen, setSonarMenuOpen] = useState(true);
  const pathName = useLocation().pathname;

  const list = () => (
    <div className={classes.list} role="presentation">
      <List className={classes.menuList} width="inher">
        {prop.currentProjectId != 0 && (
          <div>
            <ListItem button onClick={goToSelect}>
              <ListItemIcon>
                <ArrowBack />
              </ListItemIcon>
              <ListItemText primary="Select" />
            </ListItem>

            <Divider className={classes.divider} />
            <ListItem button onClick={goToDashBoard}>
              <ListItemIcon>
                <RiDashboardFill size={30} />
              </ListItemIcon>
              <ListItemText primary="DashBoard" />
            </ListItem>
            <Divider className={classes.divider} />

            {currentProject &&
              currentProject.repositoryDTOList.find(
                (x) => x.type == "github"
              ) && (
                <div>
                  <ListItem
                    button
                    onClick={() => {
                      setGithubMenuOpen(!githubMenuOpen);
                    }}
                  >
                    <ListItemIcon>
                      <SiGithub size={30} />
                    </ListItemIcon>
                    <ListItemText primary="GitHub" />
                    {githubMenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>

                  <Divider />
                  <Collapse in={githubMenuOpen} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      className={classes.innerList}
                    >
                      <MenuItem
                        button
                        className={classes.nested}
                        onClick={goToCommit}
                        selected={pathName.includes("commits")}
                      >
                        <ListItemIcon>
                          <IoGitCommitSharp size={24.5} />
                        </ListItemIcon>
                        <ListItemText primary="Commits" />
                      </MenuItem>

                      <MenuItem
                        button
                        className={classes.nested}
                        onClick={goToIssue}
                        selected={pathName.includes("issues")}
                      >
                        <ListItemIcon>
                          <GoIssueOpened size={24.5} />
                        </ListItemIcon>
                        <ListItemText primary="Issues" />
                      </MenuItem>

                      <MenuItem
                        button
                        className={classes.nested}
                        onClick={goToCodeBase}
                        selected={pathName.includes("codebase")}
                      >
                        <ListItemIcon>
                          <Code />
                        </ListItemIcon>
                        <ListItemText primary="Code Base" />
                      </MenuItem>

                      <MenuItem
                        button
                        className={classes.nested}
                        onClick={goToPullRequest}
                        selected={pathName.includes("pull-request")}
                      >
                        <ListItemIcon>
                          <GoGitPullRequest />
                        </ListItemIcon>
                        <ListItemText primary="Pull Request" />
                      </MenuItem>

                      <MenuItem
                        button
                        className={classes.nested}
                        onClick={goToContributions}
                        selected={pathName.includes("contributions")}
                      >
                        <ListItemIcon>
                          <BsFillPieChartFill />
                        </ListItemIcon>
                        <ListItemText primary="Contributions" />
                      </MenuItem>

                    </List>
                  </Collapse>
                </div>
              )}

            {currentProject &&
              currentProject.repositoryDTOList.find(
                (x) => x.type == "sonar"
              ) && (
                <div>
                  <Divider className={classes.divider} />
                  <MenuItem
                    button
                    onClick={() => {
                      setSonarMenuOpen(!sonarMenuOpen);
                    }}
                  >
                    <ListItemIcon>
                      <SiSonarqube size={30} />
                    </ListItemIcon>
                    <ListItemText primary="SonarQube" />
                    {sonarMenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </MenuItem>
                  <Divider />
                  <Collapse in={sonarMenuOpen} timeout="auto" unmountOnExit>
                    <List
                      component="div"
                      disablePadding
                      className={classes.innerList}
                    >
                      <MenuItem button onClick={goToCodeCoverage} selected={pathName.includes("code_coverage")}>
                        <ListItemIcon>
                          <GpsFixed />
                        </ListItemIcon>
                        <ListItemText primary="Code Coverage" />
                      </MenuItem>

                      <MenuItem button onClick={goToBug} selected={pathName.includes("bugs")}>
                        <ListItemIcon>
                          <AiFillBug size={24.5} />
                        </ListItemIcon>
                        <ListItemText primary="Bugs" />
                      </MenuItem>

                      <MenuItem button onClick={goToCodeSmell} selected={pathName.includes("code_smells")}>
                        <ListItemIcon>
                          <IoNuclear size={24.5} />
                        </ListItemIcon>
                        <ListItemText primary="Code Smells" />
                      </MenuItem>

                      <MenuItem button onClick={goToDuplication} selected={pathName.includes("duplications")}>
                        <ListItemIcon>
                          <HiDocumentDuplicate size={24.5} />
                        </ListItemIcon>
                        <ListItemText primary="Duplications" />
                      </MenuItem>
                    </List>
                    <Divider />
                  </Collapse>
                </div>
              )}
          </div>
        )}
      </List>
    </div>
  );

  const logout = () => {
    localStorage.clear();
    history.push("/login");
  };

  const goToSelect = () => {
    history.push("/select");
  };

  const goToDashBoard = () => {
    history.push("/dashboard");
  };

  const goToCommit = () => {
    history.push("/commits");
  };

  const goToIssue = () => {
    history.push("/issues");
  };

  const goToCodeBase = () => {
    history.push("/codebase");
  };

  const goToPullRequest = () => {
    history.push("/pull-requests");
  };

  const goToContributions = () => {
    history.push("/contributions");
  };

  const goToCodeCoverage = () => {
    history.push("/code_coverage");
  };

  const goToBug = () => {
    history.push("/bugs");
  };

  const goToCodeSmell = () => {
    history.push("/code_smells");
  };

  const goToDuplication = () => {
    history.push("/duplications");
  };

  const jwtToken = localStorage.getItem("jwtToken");

  useEffect(() => {
    if (prop.currentProjectId != 0) {
      Axios.get(
        `http://localhost:9100/pvs-api/project/1/${prop.currentProjectId}`,
        { headers: { Authorization: `${jwtToken}` } }
      )
        .then((response) => {
          setCurrentProject(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [prop.currentProjectId]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar style={{ padding: "0px" }}>
          <div
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
          >
            <img src={logo_p} />
            <img src={logo_v} />
            <img src={logo_s} />
          </div>
          <div className={classes.dateSelector}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                className={classes.datepicker}
                fullWidth
                format="YYYY-MM-DD"
                focused={false}
                // openTo="year"
                views={["year", "month", "date"]}
                label="Start Date"
                value={prop.startDate}
                onChange={prop.setStartDate}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className={classes.dateSelector}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                fullWidth
                focused={false}
                format="YYYY-MM-DD"
                // openTo="year"
                views={["year", "month", "date"]}
                label="End Date"
                value={prop.endDate}
                onChange={prop.setEndDate}
              />
            </MuiPickersUtilsProvider>
          </div>
          <IconButton className={classes.logout} onClick={logout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.drawerContent}></div>
        <Divider />
        {list()}
      </Drawer>
      <main className={classes.content}>
        <div className={classes.drawerContent} />
        {prop.children}
      </main>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    startDate: state.selectedDate.startDate,
    endDate: state.selectedDate.endDate,
    currentProjectId: state.currentProjectId,
  };
};

const mapActionToProps = (dispatch) => {
  return {
    setStartDate: (startDate) => dispatch(setStartDate(startDate)),
    setEndDate: (endDate) => dispatch(setEndDate(endDate)),
  };
};

export default connect(mapStateToProps, mapActionToProps)(Sidebar);
