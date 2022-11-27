/*
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 3 only, as
 * published by the Free Software Foundation.

 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 */

import content from './Employees.html';

import { Jobs } from '../../blocks/Jobs';
import { BaseForm } from "../../BaseForm";
import { WorkDays } from '../../misc/WorkDays';
import { Departments } from '../../blocks/Departments';
import { Employees as EmployeeBlock } from "../../blocks/Employees";
import { DatabaseResponse, EventType, formevent, FormEvent } from 'forms42core';


export class Employees extends BaseForm
{
	private emp:EmployeeBlock = new EmployeeBlock(this,"Employees");

	constructor()
	{
		super(content);
		this.title = "Employees";

		this.emp.setDateConstraint(new WorkDays(),"hire_date");

		this.emp.setListOfValues(Jobs.getJobLov(),"job_id");
		this.emp.setListOfValues(Departments.getDepartmentLov(),"department_id");
	}

	@formevent({type: EventType.PreQuery})
	public async preQuery() : Promise<boolean>
	{
		this.emp.filter.delete("job_title");
		this.emp.filter.delete("department_name");
		return(true);
	}

	@formevent({type: EventType.OnFetch})
	public async getDerivedFields() : Promise<boolean>
	{
		await this.emp.lookupJob("job_title");
		await this.emp.lookupDepartment("department_name");
		return(true);
	}

	@formevent({type: EventType.WhenValidateField, field: "salary"})
	public async validateSalary() : Promise<boolean>
	{
		return(this.emp.validateSalary());
	}

	@formevent({type: EventType.WhenValidateField, field: "job_id"})
	public async validateJob(event:FormEvent) : Promise<boolean>
	{
		return(this.emp.validateJob(event,"job_title"));
	}

	@formevent({type: EventType.WhenValidateField, field: "department_id"})
	public async validateDepatment(event:FormEvent) : Promise<boolean>
	{
		return(this.emp.validateDepartment(event,"department_name"));
	}

	@formevent({type: EventType.PostInsert})
	public async setPrimaryKey() : Promise<boolean>
	{
		let response:DatabaseResponse = this.emp.getRecord().response;
		this.emp.setValue("employee_id",response.getValue("employee_id"));
		console.log("employee_id = "+this.emp.getValue("employee_id"));
		return(true);
	}
}
