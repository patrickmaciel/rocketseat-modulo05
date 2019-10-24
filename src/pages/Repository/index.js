import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueStates: ['all', 'open', 'closed'],
    stateSelect: 'open',
  };

  async componentDidMount() {
    console.log('mount');
    const { match } = this.props;
    const { stateSelect } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    /**
     * executing that way, the second request need to wait the first request
     * to finish, then the second start */
    // const response = await api.get(`/repos/${repoName}`);
    // const response = await api.get(`/repos/${repoName}/issues`);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`),
      {
        params: {
          state: stateSelect,
          per_page: 5,
        },
      },
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  handleFilterChange = async e => {
    this.setState({
      stateSelect: e.target.value,
      loading: true,
    });

    const { repository, stateSelect } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: stateSelect,
        per_page: 5,
      },
    });

    this.setState({
      loading: false,
      issues: issues.data,
    });
  };

  render() {
    const {
      repository,
      issues,
      loading,
      issueStates,
      stateSelect,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <select
          id="issue-filter"
          onChange={e => this.handleFilterChange(e)}
          value={stateSelect}
        >
          {issueStates.map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
