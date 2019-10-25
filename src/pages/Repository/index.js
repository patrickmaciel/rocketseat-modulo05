import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, Paginator } from './styles';

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
    page: 1,
    loadingIssues: false,
  };

  async componentDidMount() {
    console.log('mount');
    const { match } = this.props;
    const { stateSelect, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    /**
     * executing that way, the second request need to wait the first request
     * to finish, then the second start */
    // const response = await api.get(`/repos/${repoName}`);
    // const response = await api.get(`/repos/${repoName}/issues`);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: stateSelect,
          per_page: 2,
          page,
        },
      }),
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
      page: 1,
    });

    this.requestIssues(e.target.value, 1);
  };

  handlePaginatorClick = page => {
    this.setState({
      page,
    });

    const { stateSelect } = this.state;
    this.requestIssues(stateSelect, page);
  };

  requestIssues = async (stateSelect, page) => {
    this.setState({
      loadingIssues: true,
    });

    const { repository } = this.state;

    const issues = await api.get(`/repos/${repository.full_name}/issues`, {
      params: {
        state: stateSelect,
        per_page: 2,
        page,
      },
    });

    this.setState({
      loadingIssues: false,
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
      page,
      loadingIssues,
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

        <IssueFilter>
          <label htmlFor="issue-filter">
            <span>Filtro: </span>

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
          </label>
        </IssueFilter>

        {!loadingIssues && (
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
        )}

        <Paginator>
          <button
            type="button"
            disabled={page === 1 ? 1 : 0}
            onClick={() => this.handlePaginatorClick(page - 1)}
          >
            <FaArrowLeft /> Anterior
          </button>
          <button
            type="button"
            onClick={() => this.handlePaginatorClick(page + 1)}
          >
            Próxima <FaArrowRight />
          </button>
        </Paginator>
      </Container>
    );
  }
}
