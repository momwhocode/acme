require "rails_helper"

RSpec.describe DirectoryQuery do
  def relation_for(params)
    described_class.new(params).relation
  end

  it "filters by country, department, type, and status" do
    match = create(:employee, country: "GB", department: "engineering",
                              employment_type: "full-time", status: "active")
    create(:employee, country: "US", department: "sales", email: "us@acme.test")

    expect(relation_for(country: "gb", department: "Engineering", type: "Full-Time",
                        status: "Active")).to eq([ match ])
  end

  it "searches first name, last name, and email" do
    ada = create(:employee, first_name: "Ada", last_name: "Lovelace", email: "ada@acme.test")
    create(:employee, first_name: "Grace", last_name: "Hopper", email: "grace@acme.test")

    expect(relation_for(q: "love")).to eq([ ada ])
  end

  it "escapes LIKE wildcards in search" do
    create(:employee, first_name: "Ada", last_name: "Lovelace")

    expect(relation_for(q: "%")).to be_empty
  end

  it "orders by last name then first name" do
    zeta = create(:employee, first_name: "Zed", last_name: "Zeta", email: "z@acme.test")
    alpha = create(:employee, first_name: "Ann", last_name: "Alpha", email: "a@acme.test")

    expect(relation_for({}).pluck(:id)).to eq([ alpha.id, zeta.id ])
  end

  it "rejects an unknown type" do
    expect { described_class.new(type: "contractor-plus").relation }.to raise_error(
      described_class::Error, "unknown type"
    )
  end

  it "rejects an unknown status" do
    expect { described_class.new(status: "onboarding").relation }.to raise_error(
      described_class::Error, "unknown status"
    )
  end

  it "clamps page and per_page" do
    query = described_class.new(page: 0, per_page: 500)

    expect(query.page).to eq(1)
    expect(query.limit).to eq(described_class::MAX_LIMIT)
  end

  it "accepts employment_type as a type alias" do
    match = create(:employee, employment_type: "contractor")
    create(:employee, employment_type: "full-time", email: "ft@acme.test")

    expect(relation_for(employment_type: "contractor")).to eq([ match ])
  end

  it "matches a full name or email" do
    ada = create(:employee, first_name: "Ada", last_name: "Lovelace", email: "ada@acme.test")
    create(:employee, first_name: "Grace", last_name: "Hopper", email: "grace@acme.test")

    expect(relation_for(q: "Ada Lovelace")).to eq([ ada ])
    expect(relation_for(q: "ada@acme.test")).to eq([ ada ])
  end

  it "ignores a blank search" do
    employee = create(:employee)

    expect(relation_for(q: "  ")).to eq([ employee ])
  end

  it "rejects a country that is not ISO-2" do
    expect { described_class.new(country: "USA").relation }.to raise_error(
      described_class::Error, "unknown country"
    )
  end

  it "uses limit when per_page is absent" do
    expect(described_class.new(limit: 10).limit).to eq(10)
  end

  it "rejects a search that is too long" do
    expect { described_class.new(q: "a" * (described_class::MAX_QUERY + 1)).relation }.to raise_error(
      described_class::Error, "q is too long"
    )
  end

  it "filters by a comma-separated country list" do
    gb = create(:employee, country: "GB")
    us = create(:employee, country: "US", email: "us@acme.test")
    create(:employee, country: "IN", email: "in@acme.test")

    expect(relation_for(country: "gb,us")).to contain_exactly(gb, us)
  end

  it "filters by a comma-separated status list" do
    active = create(:employee, status: "active")
    left = create(:employee, :left, email: "left@acme.test")

    expect(relation_for(status: "active,left")).to contain_exactly(active, left)
  end

  it "filters by a comma-separated type list" do
    intern = create(:employee, employment_type: "intern")
    contractor = create(:employee, employment_type: "contractor", email: "c@acme.test")
    create(:employee, employment_type: "full-time", email: "ft@acme.test")

    expect(relation_for(type: "intern,contractor")).to contain_exactly(intern, contractor)
  end

  it "filters by level bucket" do
    ic2 = create(:employee, level: "IC2", email: "ic2@acme.test")
    create(:employee, level: "IC4", email: "ic4@acme.test")

    expect(relation_for(level: "L2")).to eq([ ic2 ])
  end

  it "filters by manager" do
    manager = create(:employee, first_name: "Priya", last_name: "Shah", email: "priya@acme.test")
    report = create(:employee, manager: manager, email: "eng@acme.test")
    create(:employee, email: "other@acme.test")

    expect(relation_for(manager: manager.id)).to eq([ report ])
  end

  it "sorts by name descending" do
    zeta = create(:employee, first_name: "Zed", last_name: "Zeta", email: "z@acme.test")
    alpha = create(:employee, first_name: "Ann", last_name: "Alpha", email: "a@acme.test")

    expect(relation_for(sort: "lead", direction: "desc").pluck(:id)).to eq([ zeta.id, alpha.id ])
  end

  it "sorts by start date" do
    later = create(:employee, started_on: Date.new(2025, 1, 1), email: "later@acme.test")
    earlier = create(:employee, started_on: Date.new(2023, 1, 1), email: "earlier@acme.test")

    expect(relation_for(sort: "started_on", direction: "asc").pluck(:id)).to eq([ earlier.id, later.id ])
  end
end
